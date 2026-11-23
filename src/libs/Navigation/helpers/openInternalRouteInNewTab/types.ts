type ModifiedMouseEvent = {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    button?: number;
    key?: string;
    nativeEvent?: unknown;
};

type ModifiedMouseEventSource = Pick<ModifiedMouseEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'button' | 'key'>;

export type {ModifiedMouseEvent, ModifiedMouseEventSource};
