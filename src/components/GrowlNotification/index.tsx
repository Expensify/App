import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {setIsReady} from '@libs/Growl';
import type {GrowlAction, GrowlRef} from '@libs/Growl';
import GrowlNotificationContent from './GrowlNotificationContent';

type GrowlContent = {
    bodyText: string;
    type: string;
    duration: number;
    action?: GrowlAction;
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

    const show = useCallback((text: string, growlType: string, duration: number, action?: GrowlAction) => {
        setContent({bodyText: text, type: growlType, duration, action});
    }, []);

    useImperativeHandle(ref, () => ({show}), [show]);

    useEffect(() => {
        setIsReady();
    }, []);

    const handleDismissed = useCallback(() => {
        setContent(null);
    }, []);

    if (!content) {
        return null;
    }

    return (
        <GrowlNotificationContent
            bodyText={content.bodyText}
            type={content.type}
            duration={content.duration}
            action={content.action}
            onDismissed={handleDismissed}
        />
    );
}

export default React.memo(GrowlNotification);
