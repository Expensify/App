import '@testing-library/react-native';

const isVerbose = process.argv.includes('--verbose') || process.env.JEST_VERBOSE === 'true';


beforeEach(() => {
    if (isVerbose) {
        return;
    }

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

jest.useRealTimers();
