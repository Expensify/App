function writeBenchmarkLog(message: string): void {
    // Production builds strip console.info/debug/log. Warnings are retained and are not forwarded by the app's Sentry console integration.
    // eslint-disable-next-line no-console
    console.warn(message);
}

export default writeBenchmarkLog;
