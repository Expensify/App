type ComposerScrollMetrics = {
    /** The offset the Composer reads back and writes when it restores or follows the caret. */
    scrollTop: number;

    /** Full content height of the input. */
    scrollHeight: number;

    /** Visible height of the input. */
    clientHeight: number;
};

type WebComposerTextarea = {
    /** The DOM node the web Composer treats as its text input, so listener and scroll calls land on a real element. */
    element: HTMLTextAreaElement;

    /** jsdom runs no layout, so every scroll metric the Composer reads is driven from here. */
    metrics: ComposerScrollMetrics;

    /** Puts the metrics back to zero between tests. */
    reset: () => void;
};

/**
 * Builds the textarea the web Composer needs behind its ref. Jest renders the React Native tree, so each suite hands
 * this node out of the live-markdown mock's `useImperativeHandle` and the Composer then talks to a real DOM element.
 */
function createWebComposerTextarea(): WebComposerTextarea {
    const element = document.createElement('textarea');
    document.body.appendChild(element);

    const metrics: ComposerScrollMetrics = {scrollTop: 0, scrollHeight: 0, clientHeight: 0};

    Object.assign(element, {isFocused: () => document.activeElement === element});
    Object.defineProperty(element, 'scrollTop', {
        get: () => metrics.scrollTop,
        set: (next: number) => {
            metrics.scrollTop = next;
        },
    });
    Object.defineProperty(element, 'scrollHeight', {get: () => metrics.scrollHeight});
    Object.defineProperty(element, 'clientHeight', {get: () => metrics.clientHeight});

    return {
        element,
        metrics,
        reset: () => {
            Object.assign(metrics, {scrollTop: 0, scrollHeight: 0, clientHeight: 0});
        },
    };
}

export default createWebComposerTextarea;
export type {WebComposerTextarea};
