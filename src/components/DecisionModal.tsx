import React from 'react';
import {View} from 'react-native';
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

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: boolean;

    /** Callback for closing modal */
    onClose: () => void;

    /** Whether modal is visible */
    isVisible: boolean;
};

function DecisionModal({title, prompt = '', firstOptionText, secondOptionText, onFirstOptionSubmit, onSecondOptionSubmit, isSmallScreenWidth, onClose, isVisible}: DecisionModalProps) {
    const styles = useThemeStyles();

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
        >
            <View style={[styles.m5]}>
                <View>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <Header
                            title={title}
                            containerStyles={[styles.alignItemsCenter]}
                        />
                    </View>
                    <Text>{prompt}</Text>
                </View>
                {firstOptionText && (
                    <Button
                        success
                        style={[styles.mt4]}
                        onPress={onFirstOptionSubmit}
                        pressOnEnter
                        text={firstOptionText}
                    />
                )}
                <Button
                    style={[styles.mt3, styles.noSelect]}
                    onPress={onSecondOptionSubmit}
                    text={secondOptionText}
                />
            </View>
        </Modal>
    );
}

DecisionModal.displayName = 'DecisionModal';

export default DecisionModal;
