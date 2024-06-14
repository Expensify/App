// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const realReactNavigation = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');

// We only want these mocked for storybook, not jest
const useIsFocused = process.env.NODE_ENV === 'test' ? realReactNavigation.useIsFocused : () => true;

const useTheme = process.env.NODE_ENV === 'test' ? realReactNavigation.useTheme : () => ({});

type Listener = () => void;

const transitionEndListeners: Listener[] = [];

const triggerTransitionEnd = () => {
    transitionEndListeners.forEach((transitionEndListener) => transitionEndListener());
};

const addListener = jest.fn().mockImplementation((listener, callback: Listener) => {
    if (listener === 'transitionEnd') {
        transitionEndListeners.push(callback);
    }
    return () => {
        transitionEndListeners.filter((cb) => cb !== callback);
    };
});

const useNavigation = () => ({
    navigate: jest.fn(),
    ...realReactNavigation.useNavigation,
    getState: () => ({
        routes: [],
    }),
    addListener,
});

module.exports = {
    ...realReactNavigation,
    useIsFocused,
    useTheme,
    useNavigation,
    triggerTransitionEnd,
};
