export const NitroModules = {
    createHybridObject: jest.fn(() => ({
        getAll: jest.fn(() => Promise.resolve([])),
    })),
};