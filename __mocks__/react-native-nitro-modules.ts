const NitroModules = {
    createHybridObject: jest.fn(() => ({
        getAll: jest.fn(() => Promise.resolve([])),
        verticalBarEdge: 'unspecified',
        addChangeListener: jest.fn(() => () => {}),
        processFiles: jest.fn(() => Promise.resolve([])),
    })),
};

export {
    // eslint-disable-next-line import/prefer-default-export
    NitroModules,
};
