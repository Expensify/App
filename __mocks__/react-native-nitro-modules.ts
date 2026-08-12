const NitroModules = {
    createHybridObject: jest.fn(() => ({
        getAll: jest.fn(() => Promise.resolve([])),
    })),
};

export {
    /* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
    NitroModules,
};
