import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import Header from './Header';
import Modal from './Modal';
import Text from './Text';

type DecisionModalProps = {
    /** Title describing purpose of modal */
    title: string;

    /** Modal subtitle/description */
    prompt?: string;

    /** Text content used in first button */
    firstOptionText?: string;

    /** Text content used in second button */
    secondOptionText: string;

    /** onSubmit callback fired after clicking on first button */
    onFirstOptionSubmit?: () => void;

    /** onSubmit callback fired after clicking on second button */
    onSecondOptionSubmit: () => void;

    /** Callback for closing modal */
    onClose: () => void;

    /** Whether modal is visible */
    isVisible: boolean;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;
};

function DecisionModal({title, prompt = '', firstOptionText, secondOptionText, onFirstOptionSubmit, onSecondOptionSubmit, onClose, isVisible, onModalHide}: DecisionModalProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            onModalHide={onModalHide}
        >
            <View style={[styles.m5]}>
                <View>
                    <View style={[styles.flexRow, styles.mb5]}>
                        <Header
                            title={title}
                            containerStyles={[styles.alignItemsCenter]}
                        />
                    </View>
                    <Text>{prompt}</Text>
                </View>
                {!!firstOptionText && (
                    <Button
                        success
                        style={[styles.mt5]}
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
                    large
                />
            </View>
        </Modal>
    );
}

export default DecisionModal;
