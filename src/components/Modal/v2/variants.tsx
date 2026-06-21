import React from 'react';
import type {ReactNode} from 'react';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import Close from './compound/Close';
import RawContent from './compound/Content';
import type {ModalContentProps} from './compound/Content';
import {Description, Title} from './compound/Heading';
import {EdgeToEdge} from './compound/Layout';
import RawRoot from './compound/Root';
import type {ModalRootProps} from './compound/Root';
import {ModalKindContext, useActiveModalEntry, useActiveModalKind, useModal} from './compound/state';
import Trigger from './compound/Trigger';
import useAnimationDefaults from './compound/useAnimationDefaults';

type VariantRootProps = ModalRootProps;

type ModalVariant = {
    Root: (props: VariantRootProps) => ReactNode;
    Content: (props: ModalContentProps) => ReactNode;
    Title: typeof Title;
    Description: typeof Description;
    Trigger: typeof Trigger;
    Close: typeof Close;
    EdgeToEdge: typeof EdgeToEdge;
    useModal: typeof useModal;
    useActiveModalKind: typeof useActiveModalKind;
    useActiveModalEntry: typeof useActiveModalEntry;
};

type VariantConfig = {
    readonly defaultRole: typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;
    readonly topTapToDismiss?: 'always' | 'small-screen-only';
};

function createModalVariant(kind: ModalKind, config: VariantConfig): ModalVariant {
    function Root({children, ...props}: VariantRootProps) {
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
        const defaults = useAnimationDefaults(kind);
        // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- mobile-only dismiss affordance keys off raw device width, not RHP narrow-mode.
        const {isSmallScreenWidth} = useResponsiveLayout();
        const topTapToDismiss = config.topTapToDismiss === 'always' || (config.topTapToDismiss === 'small-screen-only' && isSmallScreenWidth);
        return (
            <RawContent
                kind={kind}
                role={role ?? config.defaultRole}
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

    return {Root, Content, Title, Description, Trigger, Close, EdgeToEdge, useModal, useActiveModalKind, useActiveModalEntry};
}

const AlertDialog = createModalVariant(CONST.MODAL.MODAL_TYPE.CONFIRM, {defaultRole: CONST.ROLE.ALERTDIALOG});
const BottomDockedModal = createModalVariant(CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED, {defaultRole: CONST.ROLE.DIALOG, topTapToDismiss: 'small-screen-only'});
const CenteredModal = createModalVariant(CONST.MODAL.MODAL_TYPE.CENTERED, {defaultRole: CONST.ROLE.DIALOG});
const CenteredSmallModal = createModalVariant(CONST.MODAL.MODAL_TYPE.CENTERED_SMALL, {defaultRole: CONST.ROLE.DIALOG});
const FullscreenModal = createModalVariant(CONST.MODAL.MODAL_TYPE.FULLSCREEN, {defaultRole: CONST.ROLE.DIALOG});
const RightDockedModal = createModalVariant(CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED, {defaultRole: CONST.ROLE.DIALOG});

export {AlertDialog, BottomDockedModal, CenteredModal, CenteredSmallModal, FullscreenModal, RightDockedModal};
export type {ModalVariant, VariantRootProps};
