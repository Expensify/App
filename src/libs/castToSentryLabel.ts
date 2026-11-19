import type {SentryLabel} from '@src/types/utils/SentryLabel';

/**
 * Types a label as defined, for the few core wrappers that can't narrow it: they attach a handler of their own even when
 * the caller passes none, or get the label from context. Everywhere else, check the prop that makes the element pressable
 * and TypeScript narrows the label. Lint allows this only in the files listed in `CAST_TO_SENTRY_LABEL_FILES` in
 * `oxlint.config.mts`.
 */
function castToSentryLabel(sentryLabel: SentryLabel | undefined): SentryLabel {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the props types require the label with the handlers, see above
    return sentryLabel!;
}

export default castToSentryLabel;
