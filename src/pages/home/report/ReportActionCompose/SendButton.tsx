import React, {memo} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type SendButtonProps = {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Handle clicking on send button */
    handleSendMessage: () => void;
};

function SendButton({isDisabled: isDisabledProp, handleSendMessage}: SendButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

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
                key={`${isSmallScreenWidth ? 0 : 1}`}
                gesture={Tap}
            >
                <Tooltip text={translate('common.send')}>
                    <PressableWithFeedback
                        style={({pressed, isDisabled}) => [
                            styles.chatItemSubmitButton,
                            isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                            isDisabledProp ? styles.cursorDisabled : undefined,
                        ]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.send')}
                    >
                        {({pressed}) => (
                            <Icon
                                src={Expensicons.Send}
                                fill={isDisabledProp || pressed ? theme.icon : theme.textLight}
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
