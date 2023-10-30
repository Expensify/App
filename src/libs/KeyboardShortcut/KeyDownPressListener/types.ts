type KeyDownPressCallback = (event: KeyboardEvent) => void;

type AddKeyDownPressListener = (callbackFunction: KeyDownPressCallback) => void;
type RemoveKeyDownPressListener = (callbackFunction: KeyDownPressCallback) => void;

export type {AddKeyDownPressListener, RemoveKeyDownPressListener};
