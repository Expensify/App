type RemoveFocusTrapContainerFunction = () => void;

type RegisterFocusTrapContainerCallback = (container: HTMLElement) => RemoveFocusTrapContainerFunction;

type UseFocusTrapContainers = () => [HTMLElement[], RegisterFocusTrapContainerCallback];

export type {UseFocusTrapContainers, RegisterFocusTrapContainerCallback}