import useThemeStyles from '@hooks/useThemeStyles';

import type {ButtonVariant} from '@styles/utils/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import Header from './Header';
import Modal from './Modal';
import RenderHTML from './RenderHTML';
import ScrollView from './ScrollView';

type DecisionModalProps = {
    /** Title describing purpose of modal */
    title: string;

    /** Modal subtitle/description */
    prompt?: string;

    /** Text content used in first button */
    firstOptionText?: string;

    /** Text content used in second button */
    secondOptionText: string;

    /** Whether the first option uses a success-themed button */
    isFirstOptionSuccess?: boolean;

    /** Whether the second option uses a success-themed button */
    isSecondOptionSuccess?: boolean;

    /** Whether the first option uses a danger-themed button */
    isFirstOptionDanger?: boolean;

    /** Whether the second option uses a danger-themed button */
    isSecondOptionDanger?: boolean;

    /** onSubmit callback fired after clicking on first button */
    onFirstOptionSubmit?: () => void;

    /** onSubmit callback fired after clicking on second button */
    onSecondOptionSubmit: () => void;

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: boolean;

    /** Callback for closing modal */
    onClose: () => void;

    /** Callback when modal has fully disappeared */
    onModalHide?: () => void;

    /** Whether modal is visible */
    isVisible: boolean;

    /** Whether to handle browser navigation back to close the modal */
    shouldHandleNavigationBack?: boolean;
};

function DecisionModal({
    title,
    prompt = '',
    firstOptionText,
    secondOptionText,
    onFirstOptionSubmit,
    onSecondOptionSubmit,
    isSmallScreenWidth,
    onClose,
    onModalHide,
    isVisible,
    isFirstOptionDanger = false,
    isFirstOptionSuccess = true,
    isSecondOptionSuccess = false,
    isSecondOptionDanger = false,
    shouldHandleNavigationBack,
}: DecisionModalProps) {
    const styles = useThemeStyles();

    let firstOptionVariant: ButtonVariant | undefined;
    if (isFirstOptionDanger) {
        firstOptionVariant = CONST.BUTTON_VARIANT.DANGER;
    } else if (isFirstOptionSuccess) {
        firstOptionVariant = CONST.BUTTON_VARIANT.SUCCESS;
    }

    let secondOptionVariant: ButtonVariant | undefined;
    if (isSecondOptionDanger) {
        secondOptionVariant = CONST.BUTTON_VARIANT.DANGER;
    } else if (isSecondOptionSuccess) {
        secondOptionVariant = CONST.BUTTON_VARIANT.SUCCESS;
    }

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            shouldTreatModalAsCovering
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            onModalHide={onModalHide}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScrollView
                contentContainerStyle={[styles.p5, styles.pb5]}
                addBottomSafeAreaPadding={isSmallScreenWidth}
            >
                <View>
                    <View style={[styles.flexRow, styles.mb5]}>
                        <Header
                            title={title}
                            containerStyles={styles.alignItemsCenter}
                        />
                    </View>
                    <RenderHTML html={prompt} />
                </View>
                {!!firstOptionText && (
                    <Button
                        variant={firstOptionVariant}
                        style={styles.mt5}
                        onPress={onFirstOptionSubmit}
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{firstOptionText}</Button.Text>
                    </Button>
                )}
                <Button
                    style={[firstOptionText ? styles.mt3 : styles.mt5, styles.noSelect]}
                    onPress={onSecondOptionSubmit}
                    variant={secondOptionVariant}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{secondOptionText}</Button.Text>
                </Button>
            </ScrollView>
        </Modal>
    );
}

export type {DecisionModalProps};
export default DecisionModal;
