module.exports = {
    verbose: true,
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.tsx?$': 'ts-jest',
    },
    clearMocks: true,
    resetMocks: true,
};
