import React, {useEffect, useId, useState} from 'react';
import type {ReactNode} from 'react';
import measureAnchor from '@components/Overlay/libs/measureAnchor';
import type {AnchorRect} from '@components/Overlay/libs/measureAnchor';
import useDisclosureState from '@hooks/useDisclosureState';
import {PopoverContext} from './state';
import type {PopoverActions, PopoverAnchorNode, PopoverContentRole, PopoverContextValue, PopoverMeta, PopoverState} from './state';

type PopoverRootProps = {
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    children: ReactNode;
};

function Root({isOpen, defaultOpen, onOpenChange, children}: PopoverRootProps) {
    const disclosure = useDisclosureState({isOpen, defaultOpen, onOpenChange});
    const [triggerAnchor, setTriggerAnchorState] = useState<PopoverAnchorNode | null>(null);
    const [customAnchor, setCustomAnchorState] = useState<PopoverAnchorNode | null>(null);
    const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
    const [contentRole, setContentRole] = useState<PopoverContentRole | null>(null);
    const [measurementSession, setMeasurementSession] = useState<{isOpen: boolean; anchor: PopoverAnchorNode | null}>({isOpen: disclosure.isOpen, anchor: null});
    const triggerID = useId();
    const contentID = useId();

    const hasCustomAnchor = customAnchor !== null;
    const anchor = customAnchor ?? triggerAnchor;

    if (measurementSession.isOpen !== disclosure.isOpen || measurementSession.anchor !== anchor) {
        setMeasurementSession({isOpen: disclosure.isOpen, anchor});
        if (anchorRect !== null) {
            setAnchorRect(null);
        }
    }

    useEffect(() => {
        if (!disclosure.isOpen || !anchor) {
            return undefined;
        }
        let cancelled = false;
        measureAnchor(anchor).then((rect) => {
            if (cancelled || !rect) {
                return;
            }
            setAnchorRect(rect);
        });
        return () => {
            cancelled = true;
        };
    }, [disclosure.isOpen, anchor]);

    const setTriggerAnchor = (node: PopoverAnchorNode | null | undefined) => setTriggerAnchorState(node ?? null);
    const setCustomAnchor = (node: PopoverAnchorNode | null | undefined) => setCustomAnchorState(node ?? null);

    const state: PopoverState = {
        isOpen: disclosure.isOpen,
        anchor,
        anchorRect,
        hasCustomAnchor,
        contentRole,
    };
    const actions: PopoverActions = {
        setOpen: disclosure.setOpen,
        open: disclosure.open,
        close: disclosure.close,
        toggle: disclosure.toggle,
        setTriggerAnchor,
        setCustomAnchor,
        setAnchorRect,
        setContentRole,
    };
    const meta: PopoverMeta = {triggerID, contentID};
    const value: PopoverContextValue = {state, actions, meta};

    return <PopoverContext value={value}>{children}</PopoverContext>;
}

export default Root;
export type {PopoverRootProps};
