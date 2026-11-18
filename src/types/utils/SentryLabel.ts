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
 * For components that can render read-only, e.g. a `MenuItem` without `onPress`: passing any of the `TPressProp` props
 * makes the element pressable, so it then needs a defined label. A usage without them needs none. The pressables
 * themselves use it with `onPress` and `onLongPress`, so a press handler never reaches one without a label.
 * Pass `TLabelProp` when the label has another name, e.g. `WithSentryLabelWhenPressable<'onCtaPress', 'ctaSentryLabel'>`.
 *
 * TypeScript loses the link between the label and the press props once they are destructured, so a component that
 * passes them on checks the prop that makes it pressable and passes the label in that branch (see SENTRY_LABEL.md).
 * Derive other types from one that uses this with `DistributedOmit` / `DistributedPick` from type-fest, since `Omit` and
 * `Pick` merge the union and drop the requirement.
 */
type WithSentryLabelWhenPressable<TPressProp extends PropertyKey = 'onPress', TLabelProp extends PropertyKey = 'sentryLabel'> =
    | Record<TLabelProp, SentryLabel>
    | (Partial<Record<TLabelProp, SentryLabel>> & Partial<Record<TPressProp, undefined>>);

export default WithSentryLabel;
export type {SentryLabel, WithRequiredSentryLabel, WithSentryLabelWhenPressable};
