/**
 * Because we're using the `react-native` preset of jest this file extension
 * is .native.js. Otherwise, since jest prefers index.native.js over index.js
 * it'll skip loading the mock
 */
import WebStorage from '../WebStorage';

export default WebStorage;
