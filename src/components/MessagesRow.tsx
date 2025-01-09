import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DotIndicatorMessage from './DotIndicatorMessage/DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

type MessagesRowProps = {
    /** The messages to display */
    messages: Record<string, string | ReceiptError>;

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: 'error' | 'success';

    /** A function to run when the X button next to the message is clicked */
    onClose?: () => void;

    /** Additional style object for the container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether we can dismiss the messages */
    canDismiss?: boolean;

    /** A function to dismiss error */
    dismissError?: () => void;
};

function MessagesRow({messages = {}, type, onClose = () => {}, containerStyles, canDismiss = true, dismissError = () => {}}: MessagesRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (isEmptyObject(messages)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <DotIndicatorMessage
                dismissError={dismissError}
                style={styles.flex1}
                messages={messages}
                type={type}
            />
            {canDismiss && (
                <Tooltip text={translate('common.close')}>
                    <PressableWithoutFeedback
                        onPress={onClose}
                        style={[styles.touchableButtonImage]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                    >
                        <Icon
                            fill={theme.icon}
                            src={Expensicons.Close}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
        </View>
    );
}

MessagesRow.displayName = 'MessagesRow';

export default MessagesRow;
