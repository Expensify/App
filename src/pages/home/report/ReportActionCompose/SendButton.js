import React from 'react';
import {View} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import themeColors from '../../../../styles/themes/default';
import Icon from '../../../../components/Icon';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import CONST from '../../../../CONST';
import Tooltip from '../../../../components/Tooltip';
import PressableWithFeedback from '../../../../components/Pressable/PressableWithFeedback';
import updatePropsPaperWorklet from '../../../../libs/updatePropsPaperWorklet';
import useLocalize from '../../../../hooks/useLocalize';

const propTypes = {
    /** Whether the button is disabled */
    isDisabled: PropTypes.bool.isRequired,

    /** Reference to the animated view */
    animatedRef: PropTypes.func.isRequired,

    /** Sets the isCommentEmpty flag to true */
    setIsCommentEmpty: PropTypes.func.isRequired,

    /** Submits the form */
    submitForm: PropTypes.func.isRequired,
};

function SendButton({isDisabled: isDisabledProp, animatedRef, setIsCommentEmpty, submitForm}) {
    const {translate} = useLocalize();

    const Tap = Gesture.Tap()
        .enabled()
        .onEnd(() => {
            'worklet';

            const viewTag = animatedRef();
            const viewName = 'RCTMultilineTextInputView';
            const updates = {text: ''};
            // We are setting the isCommentEmpty flag to true so the status of it will be in sync of the native text input state
            runOnJS(setIsCommentEmpty)(true);
            updatePropsPaperWorklet(viewTag, viewName, updates); // clears native text input on the UI thread
            runOnJS(submitForm)();
        });

    return (
        <View
            style={styles.justifyContentEnd}
            // Keep focus on the composer when Send message is clicked.
            onMouseDown={(e) => e.preventDefault()}
        >
            <GestureDetector gesture={Tap}>
                <Tooltip text={translate('common.send')}>
                    <PressableWithFeedback
                        style={({pressed, isDisabled}) => [
                            styles.chatItemSubmitButton,
                            isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                            isDisabledProp ? styles.cursorDisabled : undefined,
                        ]}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('common.send')}
                    >
                        {({pressed}) => (
                            <Icon
                                src={Expensicons.Send}
                                fill={isDisabledProp || pressed ? themeColors.icon : themeColors.textLight}
                            />
                        )}
                    </PressableWithFeedback>
                </Tooltip>
            </GestureDetector>
        </View>
    );
}

SendButton.propTypes = propTypes;
SendButton.displayName = 'SendButton';

export default SendButton;
