import { Catch, BadRequestException, ArgumentsHost } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Catch(WsException, BadRequestException)
export class WsExceptionFilter implements WsExceptionFilter {
    catch(exception: WsException | BadRequestException, host: ArgumentsHost) {
        const client = host.switchToWs().getClient();
        const error = exception instanceof BadRequestException
            ? exception.getResponse()
            : { message: exception.message };
        // Emit error to the client
        client.emit('error', error);
    }
}