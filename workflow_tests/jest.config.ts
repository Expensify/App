import type {Config} from '@jest/types';

// Sync object
const jestConfig: Config.InitialOptions = {
    verbose: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    clearMocks: true,
    resetMocks: true,
};

export default jestConfig;
