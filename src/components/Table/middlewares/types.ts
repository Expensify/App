type Middleware<T> = (data: T[]) => T[];

type MiddlewareHookResult<T> = {
    middleware: Middleware<T>;
    methods?: Record<string, unknown>;
};

export type {Middleware, MiddlewareHookResult};
