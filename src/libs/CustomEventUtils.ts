type CustomEventMethods = {
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
};

type CustomEvent<T extends Record<string, unknown> = Record<string, unknown>> = T & CustomEventMethods;

type CustomEventHandler<T extends Record<string, unknown> = Record<string, unknown>> = (event: CustomEvent<T>) => void;

function createCustomEvent<T extends Record<string, unknown>>(data: T): CustomEvent<T> {
    let defaultPrevented = false;
    let propagationStopped = false;

    const methods: CustomEventMethods = {
        preventDefault() {
            defaultPrevented = true;
        },
        isDefaultPrevented() {
            return defaultPrevented;
        },
        stopPropagation() {
            propagationStopped = true;
        },
        isPropagationStopped() {
            return propagationStopped;
        },
    };

    return Object.assign(Object.create(methods), data) as CustomEvent<T>;
}

/** Variadic handler composition; later handlers stop running after one calls `event.stopPropagation()`. */
function composeHandlers<T extends Record<string, unknown>>(...handlers: Array<CustomEventHandler<T> | undefined | null>): CustomEventHandler<T> {
    return (event) => {
        for (const handler of handlers) {
            if (event.isPropagationStopped()) {
                break;
            }
            handler?.(event);
        }
    };
}

export {createCustomEvent, composeHandlers};
export type {CustomEvent, CustomEventHandler};
