const useNavigation = () => ({
    navigate: () => {},
    getState: () => ({routes: []}),
    dispatch: () => {},
    goBack: () => {},
    canGoBack: () => false,
    addListener: () => () => {},
    reset: () => {},
    setParams: () => {},
    isFocused: () => true,
    getId: () => undefined,
    getParent: () => undefined,
});

export {useNavigation};
