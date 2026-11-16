// The real package is ESM-only, which Jest cannot load.
const registerTool = jest.fn();
const addAppductListener = jest.fn();

export {addAppductListener, registerTool};
