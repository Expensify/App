import '@testing-library/react-native';
import * as Log from '../scripts/utils/Logger';

const isVerbose = process.argv.includes('--verbose') || process.env.JEST_VERBOSE === 'true';

beforeEach(() => {
    if (isVerbose) {
        return;
    }

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(Log, 'log').mockImplementation(() => {});
    jest.spyOn(Log, 'info').mockImplementation(() => {});
    jest.spyOn(Log, 'success').mockImplementation(() => {});
    jest.spyOn(Log, 'warn').mockImplementation(() => {});
});

jest.useRealTimers();
