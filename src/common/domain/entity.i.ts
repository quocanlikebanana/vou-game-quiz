export abstract class Entity<T> {
    private readonly _id: string;
    private _props: T;

    public constructor(props: T, id: string) {
        this._id = id;
        this._props = props;
    }

    /**
     * Abstract method to validate the properties when the entity is created.
     * Must be implemented by subclasses.
     * Manually called by developer.
     */
    public abstract manualValidate(): void;

    public equals(entity: Entity<T>): boolean {
        return entity._id === this._id;
    }

    public get id(): string {
        return this._id;
    }

    public get props(): T {
        return this._props;
    }

    protected set props(newProps: T) {
        this._props = newProps;
    }
}