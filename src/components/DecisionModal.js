import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Title describing purpose of modal */
    title: PropTypes.string.isRequired,

    /** Modal subtitle/description */
    prompt: PropTypes.string,

    /** Text content used in first button */
    firstOptionText: PropTypes.string.isRequired,

    /** Text content used in second button */
    secondOptionText: PropTypes.string.isRequired,

    /** onSubmit callback fired after clicking on first button */
    onFirstOptionSubmit: PropTypes.func.isRequired,

    /** onSubmit callback fired after clicking on  */
    onSecondOptionSubmit: PropTypes.func.isRequired,

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Callback for closing modal */
    onClose: PropTypes.func.isRequired,

    /** Whether modal is visible */
    isVisible: PropTypes.bool.isRequired,
};

const defaultProps = {
    prompt: '',
};

function DecisionModal({title, prompt, firstOptionText, secondOptionText, onFirstOptionSubmit, onSecondOptionSubmit, isSmallScreenWidth, onClose, isVisible}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            shouldEnableFocusTrap
        >
            <View style={[styles.m5]}>
                <View>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <Header
                            title={title}
                            containerStyles={[styles.alignItemsCenter]}
                        />
                        <Tooltip text={translate('common.close')}>
                            <PressableWithoutFeedback
                                onPress={onClose}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                            >
                                <Icon src={Expensicons.Close} />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    </View>

                    <Text>{prompt}</Text>
                </View>
                <Button
                    success
                    style={[styles.mt4]}
                    onPress={onFirstOptionSubmit}
                    pressOnEnter
                    text={firstOptionText}
                />
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
DecisionModal.propTypes = propTypes;
DecisionModal.defaultProps = defaultProps;

export default DecisionModal;
