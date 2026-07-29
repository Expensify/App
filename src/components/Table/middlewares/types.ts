/**
 * A middleware function that transforms an array of data items.
 *
 * Middlewares are pure functions that receive data and return transformed data.
 * They are chained together in a pipeline: filter → search → sort.
 */
type Middleware<InputDataType, OutputDataType = InputDataType> = (data: InputDataType[]) => OutputDataType[];

/**
 * Result returned by a middleware hook.
 */
type MiddlewareHookResult<InputDataType, Methods, OutputDataType = InputDataType> = {
    /** The middleware function to apply to data. */
    middleware: Middleware<InputDataType, OutputDataType>;

    /** Optional methods exposed by the middleware for external control. */
    methods: Methods;
};

export type {Middleware, MiddlewareHookResult};
