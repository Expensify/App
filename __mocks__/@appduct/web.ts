// The real package is ESM-only, which Jest cannot load.
const registerTool = jest.fn();

// eslint-disable-next-line import/prefer-default-export
export {registerTool};
