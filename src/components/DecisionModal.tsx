import React from 'react';
import {ScrollView, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import Header from './Header';
import Modal from './Modal';
import RenderHTML from './RenderHTML';

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
    onModalHide: () => void;

    /** Whether modal is visible */
    isVisible: boolean;
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
}: DecisionModalProps) {
    const styles = useThemeStyles();

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            onModalHide={onModalHide}
        >
            <ScrollView contentContainerStyle={styles.m5}>
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
                        success={isFirstOptionSuccess}
                        danger={isFirstOptionDanger}
                        style={styles.mt5}
                        onPress={onFirstOptionSubmit}
                        pressOnEnter
                        text={firstOptionText}
                        large
                    />
                )}
                <Button
                    style={[firstOptionText ? styles.mt3 : styles.mt5, styles.noSelect]}
                    onPress={onSecondOptionSubmit}
                    text={secondOptionText}
                    success={isSecondOptionSuccess}
                    danger={isSecondOptionDanger}
                    large
                />
            </ScrollView>
        </Modal>
    );
}

export default DecisionModal;
