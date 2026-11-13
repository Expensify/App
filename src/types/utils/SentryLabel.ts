import type CONST from '@src/CONST';

import type DeepValueOf from './DeepValueOf';

/**
 * A label from `CONST.SENTRY_LABEL`. Plain strings are rejected so labels can't carry translated text, IDs or user
 * data, and so native, which drops any label that isn't in `CONST.SENTRY_LABEL`, reports every one of them.
 * See contributingGuides/SENTRY_LABEL.md.
 */
type SentryLabel = DeepValueOf<typeof CONST.SENTRY_LABEL>;

/** For inputs and components that fall back to a default label, where a press only focuses the element or the default is good enough. */
type WithSentryLabel = {
    sentryLabel?: SentryLabel;
};

/**
 * The default for components that always handle a press, e.g. a button that requires `onPress` or a menu that opens
 * itself, and for menu, dropdown and tab items: every usage passes a label.
 */
type WithRequiredSentryLabel = {
    sentryLabel: SentryLabel;
};

/**
 * Only for components that other wrappers forward an optional label to: the pressables and `Checkbox`. Every usage has
 * to write `sentryLabel`, but its value may be `undefined`. A read-only `MenuItem` has no label yet still renders a
 * pressable and passes its `undefined` label on, which `WithRequiredSentryLabel` would reject, while an optional prop
 * would stop requiring the label on pressables used directly. Don't pass `undefined` in app code.
 */
type WithExplicitSentryLabel = {
    sentryLabel: SentryLabel | undefined;
};

/**
 * For wrappers that can render read-only, e.g. a `MenuItem` without `onPress`: passing any of the `THandler` props
 * makes the element interactive, so it then needs a defined `sentryLabel` too. A usage without a handler needs no
 * label. A wrapper that forwards its own optional label has to forward the handler with it, so pass both through in
 * one object rather than destructuring them, or TypeScript loses the link between them.
 * Pass `TLabelProp` when the label has another name, e.g. `WithSentryLabelWhenPressable<'onCtaPress', 'ctaSentryLabel'>`.
 * Derive other types from one that uses this with `DistributedOmit` / `DistributedPick` from type-fest, since `Omit`
 * and `Pick` merge the union and drop the requirement.
 */
type WithSentryLabelWhenPressable<THandler extends PropertyKey = 'onPress', TLabelProp extends PropertyKey = 'sentryLabel'> =
    | Record<TLabelProp, SentryLabel>
    | (Partial<Record<TLabelProp, SentryLabel>> & Partial<Record<THandler, undefined>>);

export default WithSentryLabel;
export type {SentryLabel, WithRequiredSentryLabel, WithExplicitSentryLabel, WithSentryLabelWhenPressable};
