// cspell:ignore devicectl

import RNFS from 'react-native-fs';

const BENCHMARK_DIRECTORY_NAME = 'ExpensifyBenchmark';

function writeBenchmarkLog(message: string, spanName: string): void {
    // Keep the warning for developers inspecting unified device logs manually.
    // eslint-disable-next-line no-console
    console.warn(message);

    // Android can collect the warning from adb logcat for the launched process.
    // CoreDevice does not expose an equivalent app log stream, so iOS also persists a marker that devicectl can copy from the app container.
    const directoryPath = `${RNFS.CachesDirectoryPath}/${BENCHMARK_DIRECTORY_NAME}`;
    const markerPath = `${directoryPath}/${encodeURIComponent(spanName)}.log`;
    RNFS.mkdir(directoryPath)
        .then(() => RNFS.writeFile(markerPath, message, 'utf8'))
        .catch((error: Error) => {
            // eslint-disable-next-line no-console
            console.warn(`Failed to persist benchmark span ${spanName}.`, error);
        });
}

export default writeBenchmarkLog;
