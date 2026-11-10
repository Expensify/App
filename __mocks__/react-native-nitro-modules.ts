const NitroModules = {
    createHybridObject: jest.fn(() => ({
        getAll: jest.fn(() => Promise.resolve([])),
        detect: jest.fn(() => undefined),
        detectYuv: jest.fn(() => undefined),
        open: jest.fn(() => 1),
        release: jest.fn(),
    })),
};

export {
    // eslint-disable-next-line import/prefer-default-export
    NitroModules,
};
