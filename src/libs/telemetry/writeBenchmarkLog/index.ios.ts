import RNFS from 'react-native-fs';

const BENCHMARK_DIRECTORY_NAME = 'ExpensifyBenchmark';

function writeBenchmarkLog(message: string, spanName: string): void {
    // Keep the warning for developers inspecting unified device logs manually.
    // eslint-disable-next-line no-console
    console.warn(message);

    const directoryPath = `${RNFS.CachesDirectoryPath}/${BENCHMARK_DIRECTORY_NAME}`;
    const markerPath = `${directoryPath}/${encodeURIComponent(spanName)}.log`;
    RNFS.mkdir(directoryPath)
        .then(() => RNFS.writeFile(markerPath, message, 'utf8'))
        .catch((error: unknown) => {
            // eslint-disable-next-line no-console
            console.warn(`Failed to persist benchmark span ${spanName}.`, error);
        });
}

export default writeBenchmarkLog;
