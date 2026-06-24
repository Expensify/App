import React from 'react';
import {AlertDialog} from '@components/Modal/v2/variants';
import type {ModalVariant} from '@components/Modal/v2/variants';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import RawContent from './Content';
import type {ModalContentProps} from './Content';
import RawRoot from './Root';
import type {ModalRootProps} from './Root';
import {ModalKindContext} from './state';
import useAnimationDefaults from './useAnimationDefaults';

type DialogVariantHint = 'auto' | 'sheet' | 'dialog';

type ResolvedVariant = {
    kind: ModalKind;
    defaultRole: typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;
    topTapToDismiss: 'always' | 'small-screen-only' | null;
};

const ALERT_DIALOG: ResolvedVariant = {kind: CONST.MODAL.MODAL_TYPE.CONFIRM, defaultRole: CONST.ROLE.ALERTDIALOG, topTapToDismiss: null};
const BOTTOM_DOCKED: ResolvedVariant = {kind: CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED, defaultRole: CONST.ROLE.DIALOG, topTapToDismiss: 'small-screen-only'};

function resolveVariant(hint: DialogVariantHint, isSmallScreenWidth: boolean): ResolvedVariant {
    if (hint === 'sheet') {
        return BOTTOM_DOCKED;
    }
    if (hint === 'dialog') {
        return ALERT_DIALOG;
    }
    return isSmallScreenWidth ? BOTTOM_DOCKED : ALERT_DIALOG;
}

function createResponsiveDialogVariant(hint: DialogVariantHint): ModalVariant {
    function Root({children, ...props}: ModalRootProps) {
        // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- confirm/decision sizing diverges from narrow-layout inside RHP.
        const {isSmallScreenWidth} = useResponsiveLayout();
        const {kind} = resolveVariant(hint, isSmallScreenWidth);
        return (
            <ModalKindContext value={kind}>
                <RawRoot {...props}>{children}</RawRoot>
            </ModalKindContext>
        );
    }
    function Content({
        animationIn,
        animationOut,
        animationInTiming,
        animationOutTiming,
        role,
        escapeBehavior,
        style,
        innerStyle,
        onExitComplete,
        onBackdropPress,
        keyboardBehavior,
        swipeDirections,
        initialFocus,
        accessibilityLabel,
        children,
    }: ModalContentProps) {
        // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- mobile-only dismiss affordance keys off raw device width, not RHP narrow-mode.
        const {isSmallScreenWidth} = useResponsiveLayout();
        const variant = resolveVariant(hint, isSmallScreenWidth);
        const defaults = useAnimationDefaults(variant.kind);
        const topTapToDismiss = variant.topTapToDismiss === 'always' || (variant.topTapToDismiss === 'small-screen-only' && isSmallScreenWidth);
        return (
            <RawContent
                kind={variant.kind}
                role={role ?? variant.defaultRole}
                animationIn={animationIn ?? defaults.animationIn}
                animationOut={animationOut ?? defaults.animationOut}
                animationInTiming={animationInTiming ?? defaults.animationInTiming}
                animationOutTiming={animationOutTiming ?? defaults.animationOutTiming}
                topTapToDismiss={topTapToDismiss}
                escapeBehavior={escapeBehavior}
                style={style}
                innerStyle={innerStyle}
                onExitComplete={onExitComplete}
                onBackdropPress={onBackdropPress}
                keyboardBehavior={keyboardBehavior}
                swipeDirections={swipeDirections}
                initialFocus={initialFocus}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </RawContent>
        );
    }
    return {
        Root,
        Content,
        Title: AlertDialog.Title,
        Description: AlertDialog.Description,
        Trigger: AlertDialog.Trigger,
        Close: AlertDialog.Close,
        EdgeToEdge: AlertDialog.EdgeToEdge,
        useModal: AlertDialog.useModal,
        useActiveModalKind: AlertDialog.useActiveModalKind,
        useActiveModalEntry: AlertDialog.useActiveModalEntry,
    };
}

const AUTO_VARIANT = createResponsiveDialogVariant('auto');
const SHEET_VARIANT = createResponsiveDialogVariant('sheet');
const DIALOG_VARIANT = createResponsiveDialogVariant('dialog');

function useDialogVariant(hint: DialogVariantHint = 'auto'): ModalVariant {
    if (hint === 'sheet') {
        return SHEET_VARIANT;
    }
    if (hint === 'dialog') {
        return DIALOG_VARIANT;
    }
    return AUTO_VARIANT;
}

export default useDialogVariant;
export type {DialogVariantHint};
