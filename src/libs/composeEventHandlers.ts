function composeEventHandlers<E extends {defaultPrevented: boolean}>(
    consumerHandler: ((event: E) => void) | undefined,
    libraryHandler: (event: E) => void,
    {checkForDefaultPrevented = true}: {checkForDefaultPrevented?: boolean} = {},
): (event: E) => void {
    return function handleEvent(event: E) {
        consumerHandler?.(event);
        if (checkForDefaultPrevented && event.defaultPrevented) {
            return;
        }
        libraryHandler(event);
    };
}

export default composeEventHandlers;
