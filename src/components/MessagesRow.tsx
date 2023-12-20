import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

type MessagesRowProps = {
    /** The messages to display */
    messages: Record<string, Localize.MaybePhraseKey>;

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: 'error' | 'success';

    /** A function to run when the X button next to the message is clicked */
    onClose?: () => void;

    /** Additional style object for the container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether we can dismiss the messages */
    canDismiss?: boolean;
};

function MessagesRow({messages = {}, type, onClose = () => {}, containerStyles, canDismiss = true}: MessagesRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (isEmptyObject(messages)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <DotIndicatorMessage
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
                        <Icon src={Expensicons.Close} />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
        </View>
    );
}

MessagesRow.displayName = 'MessagesRow';

export default MessagesRow;
