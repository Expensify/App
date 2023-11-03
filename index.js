/**
 * @format
 */
import {AppRegistry} from 'react-native';
import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
import performance from 'react-native-performance';
import App from './src/App';
import Config from './src/CONFIG';
import * as Setup from './src/setup';
import * as EncrpytifyPerformanceTest from './src/testEncryptifyPerformance';

performance.mark('appStartup');

enableLegacyWebImplementation(true);

Setup.beforeAppLoad().then(() => {
    performance.measure('Encryptify WASM load', 'appStartup');
    const wasmLoadTime = performance.getEntriesByName('Encryptify WASM load')[0].duration;
    // eslint-disable-next-line no-console
    console.log(`Encryptify WASM load time: ${wasmLoadTime.toFixed(EncrpytifyPerformanceTest.PERFORMANCE_METRICS_DECIMAL_PLACES)}ms`);

    AppRegistry.registerComponent(Config.APP_NAME, () => App);
    Setup.afterAppLoad();
});
Setup.additional();
