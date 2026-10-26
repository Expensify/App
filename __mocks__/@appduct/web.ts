// The real package ships ESM only, which Jest cannot load under --experimental-vm-modules.
const registerTool = jest.fn(() => ({remove: jest.fn()}));

export {
    // eslint-disable-next-line import/prefer-default-export
    registerTool,
};
