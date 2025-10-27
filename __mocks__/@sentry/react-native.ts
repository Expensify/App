const init = jest.fn();
const captureMessage = jest.fn();
const registerNavigationContainer = jest.fn();
const reactNavigationIntegration = jest.fn(() => ({
    registerNavigationContainer,
}));
const setUser = jest.fn();
const wrap = jest.fn(<T,>(component: T): T => component);
const withProfiler = jest.fn(<T,>(component: T): T => component);

const Sentry = {
    init,
    captureMessage,
    reactNavigationIntegration,
    setUser,
    wrap,
    withProfiler,
};

export default Sentry;
export {init, captureMessage, reactNavigationIntegration, setUser, wrap, withProfiler};

