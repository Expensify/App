import React, {memo} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SendButtonProps = {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Handle clicking on send button */
    handleSendMessage: () => void;
};

function SendButton({isDisabled, handleSendMessage}: SendButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const Tap = Gesture.Tap().onEnd(() => {
        handleSendMessage();
    });

    return (
        <View
            style={styles.justifyContentEnd}
            // Keep focus on the composer when Send message is clicked.
            onMouseDown={(e) => e.preventDefault()}
        >
            <GestureDetector
                // A new GestureDetector instance must be created when switching from a large screen to a small screen
                // if not, the GestureDetector may not function correctly.
                key={`send-button-${isSmallScreenWidth ? 'small-screen' : 'normal-screen'}`}
                gesture={Tap}
            >
                <Tooltip text={translate('common.send')}>
                    <PressableWithFeedback
                        disabled={isDisabled}
                        style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                        disabledStyle={[styles.cursorDisabled, styles.buttonNoBackground]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.send')}
                    >
                        {({pressed}) => (
                            <Icon
                                src={Expensicons.Send}
                                fill={isDisabled || pressed ? theme.icon : theme.textLight}
                            />
                        )}
                    </PressableWithFeedback>
                </Tooltip>
            </GestureDetector>
        </View>
    );
}

SendButton.displayName = 'SendButton';

export default memo(SendButton);

export type {SendButtonProps};
