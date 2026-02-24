import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationKeyError} from '@src/types/onyx/OnyxCommon';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

type MessagesRowProps = {
    /** The messages to display */
    messages: Record<string, string | ReceiptError | TranslationKeyError>;

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: 'error' | 'success';

    /** A function to run when the X button next to the message is clicked */
    onDismiss?: () => void;

    /** Additional style object for the container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Additional style object for the error text */
    errorTextStyles?: StyleProp<TextStyle>;

    /** A function to dismiss error */
    dismissError?: () => void;
};

function MessagesRow({messages = {}, type, onDismiss, containerStyles, dismissError = () => {}, errorTextStyles}: MessagesRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    const showDismissButton = !!onDismiss;

    const dismissText = translate('common.dismiss');

    if (isEmptyObject(messages)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <DotIndicatorMessage
                dismissError={dismissError}
                style={styles.flex1}
                textStyles={errorTextStyles}
                messages={messages}
                type={type}
            />
            {showDismissButton && (
                <Tooltip text={dismissText}>
                    <PressableWithoutFeedback
                        onPress={onDismiss}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={dismissText}
                    >
                        <Icon
                            fill={theme.icon}
                            src={icons.Close}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
        </View>
    );
}

export default MessagesRow;
