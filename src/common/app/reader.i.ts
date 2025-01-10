export default abstract class IReader<T, U> {
    abstract read(param: T): Promise<U>;
}