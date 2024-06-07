import React, {memo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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

    return (
        <View
            style={styles.justifyContentEnd}
            // Keep focus on the composer when Send message is clicked.
            onMouseDown={(e) => e.preventDefault()}
        >
            <Tooltip text={translate('common.send')}>
                <PressableWithFeedback
                    style={({pressed, isDisabled}) => [
                        styles.chatItemSubmitButton,
                        isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                        isDisabledProp ? styles.cursorDisabled : undefined,
                    ]}
                    role={CONST.ROLE.BUTTON}
                    onPress={handleSendMessage}
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
        </View>
    );
}

SendButton.displayName = 'SendButton';

export default memo(SendButton);
