module.exports = {
    verbose: true,
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {babelConfig: true}],
    },
    clearMocks: true,
    resetMocks: true,
};
