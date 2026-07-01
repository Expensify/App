const LOG_LINE_PREFIX = 'VCR_LOG ';

function write(level: string, message: string, params: unknown = {}): void {
    const record = {level, message, params, time: new Date().toISOString()};
    process.stderr.write(`${LOG_LINE_PREFIX}${JSON.stringify(record)}\n`);
}

const Log = {
    warn: (message: string, params?: unknown) => write('warn', message, params),
    hmmm: (message: string, params?: unknown) => write('hmmm', message, params),
    info: (message: string, params?: unknown) => write('info', message, params),
    alert: (message: string, params?: unknown) => write('alert', message, params),
    error: (message: string, params?: unknown) => write('alert', message, params),
};

export default Log;
