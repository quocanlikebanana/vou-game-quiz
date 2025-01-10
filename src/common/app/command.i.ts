export default abstract class ICommand<T, U = void> {
    abstract execute(param: T): Promise<U>;
}