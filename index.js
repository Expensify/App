/**
 * @format
 */
import {AppRegistry} from 'react-native';
import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
import App from './src/App';
import Config from './src/CONFIG';
import * as Setup from './src/setup';
import performance from 'react-native-performance';
import {PERFORMANCE_METRICS_DECIMAL_PLACES} from './src/testEncryptifyPerformance';

performance.mark('appStartup');

enableLegacyWebImplementation(true);

Setup.beforeAppLoad().then(() => {
    performance.measure('Encryptify WASM load', 'appStartup');
    const wasmLoadTime = performance.getEntriesByName('Encryptify WASM load')[0].duration;
    console.log(`Encryptify WASM load time: ${wasmLoadTime.toFixed(PERFORMANCE_METRICS_DECIMAL_PLACES)}ms`);

    AppRegistry.registerComponent(Config.APP_NAME, () => App);
    Setup.afterAppLoad();
});
Setup.additional();
