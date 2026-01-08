/**
 * A middleware function that transforms an array of data items.
 *
 * Middlewares are pure functions that receive data and return transformed data.
 * They are chained together in a pipeline: filter → search → sort.
 *
 * @template T - The type of items in the data array.
 */
type Middleware<T> = (data: T[]) => T[];

/**
 * Result returned by a middleware hook.
 *
 * @template T - The type of items in the data array.
 */
type MiddlewareHookResult<T, Methods> = {
    /** The middleware function to apply to data. */
    middleware: Middleware<T>;

    /** Optional methods exposed by the middleware for external control. */
    methods: Methods;
};

export type {Middleware, MiddlewareHookResult};
