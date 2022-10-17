import _ from 'underscore';
import performance from 'react-native-performance';
import MDTable from '../MDTable';

const decoratedAliases = new Set();

/**
 * Capture a start mark to performance entries
 * @param {string} alias
 * @param {Array<*>} args
 * @returns {{name: string, startTime:number, detail: {args: [], alias: string}}}
 */
function addMark(alias, args) {
    return performance.mark(alias, {detail: {args, alias}});
}

/**
 * Capture a measurement between the start mark and now
 * @param {{name: string, startTime:number, detail: {args: []}}} startMark
 * @param {*} detail
 */
function measureMarkToNow(startMark, detail) {
    performance.measure(`${startMark.name} [${startMark.detail.args.toString()}]`, {
        start: startMark.startTime,
        end: performance.now(),
        detail: {...startMark.detail, ...detail},
    });
}

/**
 * Wraps a function with metrics capturing logic
 * @param {function} func
 * @param {String} [alias]
 * @returns {function} The wrapped function
 */
function decorateWithMetrics(func, alias = func.name) {
    if (decoratedAliases.has(alias)) {
        throw new Error(`"${alias}" is already decorated`);
    }

    decoratedAliases.add(alias);

    function decorated(...args) {
        const mark = addMark(alias, args);

        const originalPromise = func.apply(this, args);

        /*
        * Then handlers added here are not affecting the original promise
        * They create a separate chain that's not exposed (returned) to the original caller
        * */
        originalPromise
            .then((result) => {
                measureMarkToNow(mark, {result});
            })
            .catch((error) => {
                measureMarkToNow(mark, {error});
            });

        return originalPromise;
    }

    return decorated;
}

/**
 * Calculate the total sum of a given key in a list
 * @param {Array<Record<prop, Number>>} list
 * @param {string} prop
 * @returns {number}
 */
function sum(list, prop) {
    return _.reduce(list, (memo, next) => memo + next[prop], 0);
}

/**
 * Aggregates and returns benchmark information
 * @returns {{summaries: Record<string, Object>, totalTime: number, lastCompleteCall: *}}
 * An object with
 * - `totalTime` - total time spent by decorated methods
 * - `lastCompleteCall` - millisecond since launch the last call completed at
 * - `summaries` - mapping of all captured stats: summaries.methodName -> method stats
 */
function getMetrics() {
    const summaries = _.chain(performance.getEntriesByType('measure'))
        .filter(entry => entry.detail && decoratedAliases.has(entry.detail.alias))
        .groupBy(entry => entry.detail.alias)
        .map((calls, methodName) => {
            const total = sum(calls, 'duration');
            const avg = (total / calls.length) || 0;
            const max = _.max(calls, 'duration').duration || 0;
            const min = _.min(calls, 'duration').duration || 0;

            // Latest complete call (by end time) for all the calls made to the current method
            const lastCall = _.max(calls, call => call.startTime + call.duration);

            return [methodName, {
                methodName,
                total,
                max,
                min,
                avg,
                lastCall,
                calls,
            }];
        })
        .object() // Create a map like methodName -> StatSummary
        .value();

    const totalTime = sum(_.values(summaries), 'total');

    // Latest complete call (by end time) of all methods up to this point
    const lastCompleteCall = _.max(
        _.values(summaries),
        summary => summary.lastCall.startTime + summary.lastCall.duration,
    ).lastCall;

    return {
        totalTime,
        summaries,
        lastCompleteCall,
    };
}

/**
 * Convert milliseconds to human readable time
 * @param {number} millis
 * @param {boolean} [raw=false]
 * @returns {string|number}
 */
function toDuration(millis, raw = false) {
    if (raw) {
        return millis;
    }

    const minute = 60 * 1000;
    if (millis > minute) {
        return `${(millis / minute).toFixed(1)}min`;
    }

    const second = 1000;
    if (millis > second) {
        return `${(millis / second).toFixed(2)}sec`;
    }

    return `${millis.toFixed(3)}ms`;
}

/**
 * Print extensive information on the dev console
 * max, min, average, total time for each method
 * and a table of individual calls
 *
 * @param {Object} [options]
 * @param {boolean} [options.raw=false] - setting this to true will print raw instead of human friendly times
 * Useful when you copy the printed table to excel and let excel do the number formatting
 * @param {'console'|'csv'|'json'|'string'} [options.format=console] The output format of this function
 * `string` is useful when __DEV__ is set to `false` as writing to the console is disabled, but the result of this
 * method would still get printed as output
 * @param {string[]} [options.methods] Print stats only for these method names
 * @returns {string|undefined}
 */
function printMetrics({raw = false, format = 'console', methods} = {}) {
    const {totalTime, summaries, lastCompleteCall} = getMetrics();

    const tableSummary = MDTable.factory({
        heading: ['method', 'total time spent', 'max', 'min', 'avg', 'time last call completed', 'calls made'],
        leftAlignedCols: [0],
    });

    /* Performance marks (startTimes) are relative to system uptime
     * timeOrigin is the point at which the app started to init
     * We use timeOrigin to display times relative to app launch time
     * See: https://github.com/oblador/react-native-performance/issues/50 */
    const timeOrigin = performance.timeOrigin;
    const methodNames = _.isArray(methods) ? methods : _.keys(summaries);

    const methodCallTables = _.chain(methodNames)
        .filter(methodName => summaries[methodName] && summaries[methodName].avg > 0)
        .map((methodName) => {
            const {calls, ...methodStats} = summaries[methodName];
            tableSummary.addRow(
                methodName,
                toDuration(methodStats.total, raw),
                toDuration(methodStats.max, raw),
                toDuration(methodStats.min, raw),
                toDuration(methodStats.avg, raw),
                toDuration((methodStats.lastCall.startTime + methodStats.lastCall.duration) - timeOrigin, raw),
                calls.length,
            );

            return MDTable.factory({
                title: methodName,
                heading: ['start time', 'end time', 'duration', 'args'],
                leftAlignedCols: [3],
                rows: _.map(calls, call => ([
                    toDuration(call.startTime - performance.timeOrigin, raw),
                    toDuration((call.startTime + call.duration) - timeOrigin, raw),
                    toDuration(call.duration, raw),
                    _.map(call.detail.args, String).join(', ').slice(0, 60), // Restrict cell width to 60 chars max
                ])),
            });
        })
        .value();

    if (/csv|json|string/i.test(format)) {
        const allTables = [tableSummary, ...methodCallTables];

        return _.map(allTables, (table) => {
            switch (format.toLowerCase()) {
                case 'csv':
                    return table.toCSV();
                case 'json':
                    return table.toJSON();
                default:
                    return table.toString();
            }
        }).join('\n\n');
    }

    const lastComplete = lastCompleteCall && toDuration(
        (lastCompleteCall.startTime + lastCompleteCall.duration) - timeOrigin, raw,
    );

    const mainOutput = [
        '### Onyx Benchmark',
        `  - Total: ${toDuration(totalTime, raw)}`,
        `  - Last call finished at: ${lastComplete || 'N/A'}`,
        '',
        tableSummary.toString(),
    ];

    /* eslint-disable no-console */
    console.info(mainOutput.join('\n'));
    methodCallTables.forEach((table) => {
        console.groupCollapsed(table.getTitle());
        console.info(table.toString());
        console.groupEnd();
    });
    /* eslint-enable */
}

/**
 * Clears all collected metrics.
 */
function resetMetrics() {
    const {summaries} = getMetrics();

    _.chain(summaries)
        .map(summary => summary.calls)
        .flatten()
        .each((measure) => {
            performance.clearMarks(measure.detail.alias);
            performance.clearMeasures(measure.name);
        });
}

export {
    decorateWithMetrics,
    getMetrics,
    resetMetrics,
    printMetrics,
};
