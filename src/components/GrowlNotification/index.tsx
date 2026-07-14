import {setIsReady} from '@libs/Growl';
import type {GrowlAction, GrowlRef, GrowlType} from '@libs/Growl';

import type {ForwardedRef} from 'react';

import React, {useEffect, useImperativeHandle, useState} from 'react';

import GrowlNotificationContent from './GrowlNotificationContent';

type GrowlContent = {
    bodyText: string;
    type: GrowlType;
    duration: number;
    action?: GrowlAction;

    /** Bumped on every show() call so identical-args re-shows still remount and re-trigger the growl. */
    nonce: number;
};

type GrowlNotificationProps = {
    /** Reference to outer element */
    ref?: ForwardedRef<GrowlRef>;
};

/**
 * Outer growl shell. Intentionally does NOT subscribe to navigation/theme/responsive contexts —
 * those live in GrowlNotificationContent, which is mounted only while a growl is visible.
 * This keeps the shell from re-rendering on every screen change, focus change, etc.
 */
function GrowlNotification({ref}: GrowlNotificationProps) {
    const [content, setContent] = useState<GrowlContent | null>(null);

    const show = (text: string, growlType: GrowlType, duration: number, action?: GrowlAction) => {
        setContent((prev) => ({bodyText: text, type: growlType, duration, action, nonce: (prev?.nonce ?? 0) + 1}));
    };

    useImperativeHandle(ref, () => ({show}), [show]);

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
            nonce={content.nonce}
            onDismissed={handleDismissed}
        />
    );
}

export default GrowlNotification;
