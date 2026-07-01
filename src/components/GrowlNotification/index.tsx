import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useState} from 'react';
import {setIsReady} from '@libs/Growl';
import type {GrowlAction, GrowlRef, GrowlType} from '@libs/Growl';
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

    const handleDismissed = () => {
        setContent(null);
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
            onDismissed={handleDismissed}
        />
    );
}

export default GrowlNotification;
