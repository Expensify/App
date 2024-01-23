const isWindowReadyToFocus = () => ({
    then: (callback: () => void) => callback?.(),
});

export default isWindowReadyToFocus;
