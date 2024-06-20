/* eslint-disable @typescript-eslint/naming-convention */
import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
    },
    clearMocks: true,
    resetMocks: true,
};

export default config;
