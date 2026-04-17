import React, {useLayoutEffect, useRef} from 'react';
import type {Role, View} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import mergeRefs from '@libs/mergeRefs';
import GenericPressable from './BaseGenericPressable';

function WebGenericPressable({focusable = true, ref, sentryLabel, ...props}: PressableProps) {
    const accessible = (props.accessible ?? props.accessible === undefined) ? true : props.accessible;

    // react-native-web's Pressable always sets aria-disabled from its own `disabled` prop,
    // overriding any explicit aria-disabled we pass. We pass fullDisabled (not isDisabled) to
    // preserve interaction/focus behavior, so we must set aria-disabled imperatively instead.
    const internalRef = useRef<View>(null);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- `||` is intentional so that falsy values like empty string or 0 are treated as not-disabled
    const isAriaDisabled = props.fullDisabled || props.disabled || props.accessibilityState?.disabled;
    useLayoutEffect(() => {
        const el = internalRef.current as unknown as HTMLElement | null;
        if (!el) {
            return;
        }
        if (isAriaDisabled) {
            el.setAttribute('aria-disabled', 'true');
        } else {
            el.removeAttribute('aria-disabled');
        }
    }, [isAriaDisabled]);

    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={mergeRefs(internalRef, ref)}
            // change native accessibility props to web accessibility props
            focusable={focusable}
            tabIndex={(props.tabIndex ?? (!accessible || !focusable)) ? -1 : 0}
            role={(props.accessibilityRole ?? props.role) as Role}
            id={props.id}
            aria-label={props.accessibilityLabel}
            aria-labelledby={props.accessibilityLabelledBy}
            aria-valuenow={props.accessibilityValue?.now}
            aria-valuemin={props.accessibilityValue?.min}
            aria-valuemax={props.accessibilityValue?.max}
            aria-valuetext={props.accessibilityValue?.text}
            // Note: data-tag="pressable" is also used by Sentry's INP instrumentation patch to detect pressable containers
            // and shorten interaction selectors. See patches/sentry-core/ before removing or renaming it.
            dataSet={{tag: 'pressable', ...(props.noDragArea && {dragArea: false}), ...(sentryLabel && {sentryLabel}), ...props.dataSet}}
        />
    );
}

export default WebGenericPressable;
