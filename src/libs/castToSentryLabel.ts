import type {SentryLabel} from '@src/types/utils/SentryLabel';

/**
 * Types a label as defined, so a component can pass it on together with the press handlers it takes out of its props.
 *
 * The props types already require the label whenever a handler is passed, but TypeScript loses that link once both are
 * taken out of the props object. The handlers are always passed on, so if a cast or untyped data ever lets a handler
 * through without a label, only the label is missing in Sentry and the press still works.
 */
function castToSentryLabel(sentryLabel: SentryLabel | undefined): SentryLabel {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the props types require the label with the handlers, see above
    return sentryLabel!;
}

export default castToSentryLabel;
