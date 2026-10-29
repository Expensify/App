type CustomEvent = {
    preventDefault(): void;
    isDefaultPrevented(): boolean;
};

function createCustomEvent(): CustomEvent {
    let defaultPrevented = false;
    return {
        preventDefault() {
            defaultPrevented = true;
        },
        isDefaultPrevented() {
            return defaultPrevented;
        },
    };
}

export {createCustomEvent};
export type {CustomEvent};
