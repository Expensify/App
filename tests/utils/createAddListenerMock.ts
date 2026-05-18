type Listener = () => void;

/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * The reason we need this is because we need to trigger the transitionEnd event in our tests to simulate
 * the transitionEnd event that is triggered when the screen transition animation is completed.
 *
 * @returns An object with two functions: triggerTransitionEnd and addListener
 */
const createAddListenerMock = () => {
    const transitionEndListeners: Listener[] = [];
    const triggerTransitionEnd = () => {
        for (const transitionEndListener of transitionEndListeners) {
            transitionEndListener();
        }
    };

    const addListener = jest.fn().mockImplementation((listener, callback: Listener) => {
        if (listener === 'transitionEnd') {
            transitionEndListeners.push(callback);
        }
        return () => {
            transitionEndListeners.filter((cb) => cb !== callback);
        };
    });

    return {triggerTransitionEnd, addListener};
};

export default createAddListenerMock;
