module.exports = {
    preset: 'ts-jest',
    verbose: true,
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
    },
    clearMocks: true,
    resetMocks: true,
};
