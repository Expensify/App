import writeBenchmarkLog from '@libs/telemetry/writeBenchmarkLog/index.ios';

const mockMkdir = jest.fn<Promise<void>, [string]>(() => Promise.resolve());
const mockWriteFile = jest.fn<Promise<void>, [string, string, string]>(() => Promise.resolve());

jest.mock('react-native-fs', () => ({
    CachesDirectoryPath: '/Library/Caches',
    mkdir: (...args: [string]) => mockMkdir(...args),
    writeFile: (...args: [string, string, string]) => mockWriteFile(...args),
}));

describe('iOS benchmark span logging', () => {
    it('persists the tagged event to a span-specific app-container marker', async () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            writeBenchmarkLog('[EXPENSIFY_BENCHMARK] {"durationMs":250}', 'Manual/App Startup');
            await Promise.resolve();
            await Promise.resolve();

            expect(mockMkdir).toHaveBeenCalledWith('/Library/Caches/ExpensifyBenchmark');
            expect(mockWriteFile).toHaveBeenCalledWith('/Library/Caches/ExpensifyBenchmark/Manual%2FApp%20Startup.log', '[EXPENSIFY_BENCHMARK] {"durationMs":250}', 'utf8');
        } finally {
            consoleWarn.mockRestore();
        }
    });
});
