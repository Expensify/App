import Log from '@server/libs/log';

const log = new Log({
    processName: 'victory-chart-renderer',
    scriptName: 'victory-chart-renderer',
    sourceTag: 'script',
    callerTag: 'vcr',
});

export default log;
