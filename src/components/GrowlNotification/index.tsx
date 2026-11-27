import {setIsReady} from '@libs/Growl';
import type {GrowlAction, GrowlPosition, GrowlRef, GrowlType} from '@libs/Growl';

import type {ForwardedRef} from 'react';

import React, {useEffect, useImperativeHandle, useState} from 'react';

import GrowlNotificationContent from './GrowlNotificationContent';

type GrowlContent = {
    bodyText: string;
    type: GrowlType;
    duration: number;
    action?: GrowlAction;

    /** Position where the growl is anchored */
    position?: GrowlPosition;

    /** Different for every show() call so identical-args re-shows still remount and re-trigger the growl. */
    nonce: number;

    /** Set by hide() to make the growl slide out */
    shouldDismiss?: boolean;

    /** Whether a loading spinner replaces the icon of the growl */
    shouldShowSpinner?: boolean;
};

// Module level, so the count survives a remount: a nonce handed out earlier must never identify a later growl
let lastNonce = 0;

type GrowlNotificationProps = {
    ref?: ForwardedRef<GrowlRef>;
};

/**
 * Outer growl shell. Intentionally does NOT subscribe to navigation/theme/responsive contexts —
 * those live in GrowlNotificationContent, which is mounted only while a growl is visible.
 * This keeps the shell from re-rendering on every screen change, focus change, etc.
 */
function GrowlNotification({ref}: GrowlNotificationProps) {
    const [content, setContent] = useState<GrowlContent | null>(null);

    const show: NonNullable<GrowlRef['show']> = ({bodyText, type, duration, action, position, shouldShowSpinner}) => {
        lastNonce += 1;
        setContent({
            bodyText,
            type,
            duration,
            action,
            position,
            shouldShowSpinner,
            nonce: lastNonce,
        });
        return lastNonce;
    };

    const hide: NonNullable<GrowlRef['hide']> = (nonce) => {
        // Only the growl with this nonce is hidden, a newer one stays
        setContent((prev) => (prev?.nonce === nonce ? {...prev, shouldDismiss: true} : prev));
    };

    useImperativeHandle(ref, () => ({show, hide}), [show, hide]);

    useEffect(() => {
        setIsReady();
    }, []);

    // Nonce-guarded: a stale dismiss (e.g. a slide-out completion callback from a previous
    // growl that was replaced mid-animation) must not clear a newer growl.
    const handleDismissed = (dismissedNonce: number) => {
        setContent((prev) => (prev?.nonce === dismissedNonce ? null : prev));
    };

    if (!content) {
        return null;
    }

    return (
        <GrowlNotificationContent
            key={content.nonce}
            bodyText={content.bodyText}
            type={content.type}
            duration={content.duration}
            action={content.action}
            position={content.position}
            nonce={content.nonce}
            shouldDismiss={content.shouldDismiss}
            shouldShowSpinner={content.shouldShowSpinner}
            onDismissed={handleDismissed}
        />
    );
}

export default GrowlNotification;
