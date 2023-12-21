import ClearReportNotifications from './types';

/**
 * This is a temporary fix for issues with our Notification Cache not being cleared in Android.
 * More info here: https://github.com/Expensify/App/issues/33367#issuecomment-1865196381
 */
const clearReportNotifications: ClearReportNotifications = () => {};

export default clearReportNotifications;
