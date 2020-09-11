/**
 * Since Beforeunload is only used for the ActiveClientManager, which
 * is only necessary for web when there are multiple tabs open, this component
 * is a no-op for native devices.
 */
export default () => {};
