type ModifiedMouseEvent = {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    shiftKey?: boolean;
    metaKey?: boolean;
    ctrlKey?: boolean;
    button?: number;
    key?: string;
    nativeEvent?: unknown;
};

type ModifiedMouseEventSource = Pick<ModifiedMouseEvent, 'metaKey' | 'ctrlKey' | 'button' | 'key'>;

export type {ModifiedMouseEvent, ModifiedMouseEventSource};
