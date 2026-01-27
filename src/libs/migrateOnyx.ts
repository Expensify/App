import CONST from '@src/CONST';
import Log from './Log';
import ConvertPolicyChatReportIDsToString from './migrations/ConvertPolicyChatReportIDsToString';
import RenameEmojiSkinTone from './migrations/RenameEmojiSkinTone';
import RenameReceiptFilename from './migrations/RenameReceiptFilename';
import {endSpan, getSpan, startSpan} from './telemetry/activeSpans';

export default function () {
    const startTime = Date.now();
    Log.info('[Migrate Onyx] start');

    return new Promise<void>((resolve) => {
        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX_MIGRATIONS, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX_MIGRATIONS,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX_MIGRATIONS,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX),
        });

        // Add all migrations to an array so they are executed in order
        const migrationPromises = [RenameReceiptFilename, RenameEmojiSkinTone, ConvertPolicyChatReportIDsToString];

        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        /* eslint-disable arrow-body-style */
        migrationPromises
            .reduce<Promise<void | void[]>>((previousPromise, migrationPromise) => {
                return previousPromise.then(() => {
                    return migrationPromise();
                });
            }, Promise.resolve())

            // Once all migrations are done, resolve the main promise
            .then(() => {
                const timeElapsed = Date.now() - startTime;
                Log.info(`[Migrate Onyx] finished in ${timeElapsed}ms`);
                resolve();
            })
            .finally(() => {
                endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX_MIGRATIONS);
            });
    });
}
