import { Server, Socket } from 'socket.io';
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import LoggerService from 'src/infra/common/logger.service';
import { JoinQuizParam } from 'src/commands/user-quiz/join-quiz/join-quiz.param';
import { PrismaService } from 'src/infra/common/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { QuizGameStartedDomainEvent } from 'src/domain/quiz-game/domain-events/quiz-game-started.de';
import { QuizGameNextedDomainEvent } from 'src/domain/quiz-game/domain-events/quiz-game-nexted.de';
import { QuestionDisplayReader } from 'src/infra/readers/question-display/question-display.reader';
import { evaluateScore } from 'src/domain/helper/evaluateScore';
import { SubmitAnswerCommand } from 'src/commands/user-quiz/submit-answer/submit-answer.command';
import { SubmitAnswerParam } from 'src/commands/user-quiz/submit-answer/submit-answer.param';
import { JoinQuizCommand } from 'src/commands/user-quiz/join-quiz/join-quiz.command';
import { GetUserResultReader } from 'src/infra/readers/get-user-result/get-user-result.reader';
import { TopUsersReader } from 'src/infra/readers/top-users/top-users.reader';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from './ws-filters';
import { EvaluateUserAnswerReader } from 'src/infra/readers/evaluate-user-answer/evaluate-user-answer.reader';


const port = process.env.SOCKET_PORT || 4101;

@WebSocketGateway(+port, { cors: "*", namespace: 'quiz' })
@UseFilters(new WsExceptionFilter())
export class QuizGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly logger: LoggerService,
        private readonly prismaService: PrismaService,
        private readonly submittAnswerCommand: SubmitAnswerCommand,
        private readonly joinQuizCommand: JoinQuizCommand,
        private readonly questionDisplayReader: QuestionDisplayReader,
        private readonly getUserResultReader: GetUserResultReader,
        private readonly topUserReader: TopUsersReader,
        private readonly evaluateUserAnswerReader: EvaluateUserAnswerReader
    ) { }

    @WebSocketServer() server: Server;

    @SubscribeMessage('join')
    @UsePipes(new ValidationPipe({ transform: true }))
    async handleJoinQuiz(client: Socket, payload: JoinQuizParam): Promise<void> {
        try {
            const userQuiz = await this.prismaService.userQuiz.findUnique({
                where: {
                    userId_gameOfEventId: {
                        userId: payload.userId,
                        gameOfEventId: payload.gameOfEventId
                    }
                }
            });
            if (userQuiz == null) {
                await this.joinQuizCommand.execute(payload);
            }
            client.join(payload.gameOfEventId);
            client.data.userId = payload.userId;
            client.data.gameOfEventId = payload.gameOfEventId;
            client.emit("user-joined", `User ${payload.userId} joined quiz with room: ${payload.gameOfEventId}`);
        } catch (error) {
            console.error(error);
        }
    }

    @SubscribeMessage('submit')
    async handleSubmitAnswer(client: Socket, payload: SubmitAnswerParam): Promise<void> {
        try {
            await this.submittAnswerCommand.execute(payload);
        } catch (error) {
            console.error(error);
        }
    }

    @SubscribeMessage('leave')
    handleLeaveQuiz(client: Socket, payload: any): void {
        client.leave(client.data.gameOfEventId);
        this.logger.info(`User ${client.data.userId} left quiz with room: ${client.data.gameOfEventId}`);
    }

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: { message: string }): void {
        this.server.to(client.data.gameOfEventId).emit('user-message', {
            userId: client.data.userId,
            message: payload.message
        });
    }

    @OnEvent("quiz-game.started")
    handleQuizStart(payload: QuizGameStartedDomainEvent): void {
        this.server.to(payload.gameOfEventId).emit('quiz-started');
    }

    @OnEvent("quiz-game.display", { async: true })
    async handleQuizNext(payload: QuizGameNextedDomainEvent): Promise<void> {
        const question = await this.questionDisplayReader.read({ gameOfEventId: payload.gameOfEventId });
        this.server.to(payload.gameOfEventId).emit('quiz-nexted', {
            question
        });
    }

    @OnEvent("quiz-game.evaluate-users", { async: true })
    async handleQuizAnswered(payload: QuizGameNextedDomainEvent): Promise<void> {
        if (payload.questionIndex <= 0) {
            return;
        }
        const sockets = await this.server.to(payload.gameOfEventId).fetchSockets();
        for (const socket of sockets) {
            const { userId, gameOfEventId } = socket.data;
            const result = await this.evaluateUserAnswerReader.read({
                userId,
                gameOfEventId
            });
            if (result == null) {
                continue;
            }
            socket.emit('user-result', {
                ...result
            });
        }
    }

    @OnEvent("quiz-game.ended", { async: true })
    async handleQuizEnded(payload: QuizGameNextedDomainEvent): Promise<void> {
        const topUsers = await this.topUserReader.read({
            gameOfEventId: payload.gameOfEventId,
            page: 1,
            perPage: 10
        });
        const sockets = await this.server.to(payload.gameOfEventId).fetchSockets();
        for (const socket of sockets) {
            const { userId, gameOfEventId } = socket.data;
            const result = await this.getUserResultReader.read({
                userId,
                gameOfEventId
            });
            socket.emit('quiz-ended', {
                topUsers,
                userResult: result
            });
        }
    }

    afterInit(server: any) {
        this.logger.info(`Server initialized at: ${new Date().toISOString()}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.info(`Client connected: ${client.id} at: ${new Date().toISOString()}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.info(`Client disconnected: ${client.id} at: ${new Date().toISOString()}`);
    }
}
