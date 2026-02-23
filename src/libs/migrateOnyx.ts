import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';
import Log from './Log';
import ConvertPolicyChatReportIDsToString from './migrations/ConvertPolicyChatReportIDsToString';
import RenameEmojiSkinTone from './migrations/RenameEmojiSkinTone';
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

        const migrations = [
            {name: 'RenameEmojiSkinTone', migration: RenameEmojiSkinTone},
            {name: 'ConvertPolicyChatReportIDsToString', migration: ConvertPolicyChatReportIDsToString},
        ];

        /* eslint-disable arrow-body-style */
        migrations
            .reduce<Promise<void | void[]>>((previousPromise, {name, migration}) => {
                return previousPromise.then(() => {
                    const span = Sentry.startInactiveSpan({
                        name,
                        op: 'migration',
                        parentSpan: getSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX_MIGRATIONS),
                    });
                    return migration().finally(() => {
                        span?.setStatus({code: 1});
                        span?.end();
                    });
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
