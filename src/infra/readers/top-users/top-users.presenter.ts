export class TopUsersPresenter {
    data: {
        userId: string;
        gameOfEventId: string;
        score: number;
        top: number;
    }[];
    page: number;
    perPage: number;
    totalUser: number;
}