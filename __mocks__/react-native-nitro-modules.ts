const NitroModules = {
    createHybridObject: jest.fn(() => ({
        getAll: jest.fn(() => Promise.resolve([])),
        edge: 'unspecified',
        addEdgeListener: jest.fn(() => () => {}),
    })),
};

export {
    // eslint-disable-next-line import/prefer-default-export
    NitroModules,
};
