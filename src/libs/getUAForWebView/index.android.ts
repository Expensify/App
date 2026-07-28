import type GetUAForWebView from './types';

/**
 * Android WebView is built on top of Chromium which is not supported by Xero causing the site to show warning.
 */
const getUAForWebView: GetUAForWebView = () => 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.159 Mobile Safari/537.36';

export default getUAForWebView;
