/**
 * The API library has a request for Wallet_GetOnfidoSDKToken which needs to know if the request is coming from
 * the native platform or the non-native platform. This module will return true for the native platforms and false
 * for the non-native platforms
 * @type {boolean}
 */
const isViaExpensifyCashNative = true;
export default isViaExpensifyCashNative;
