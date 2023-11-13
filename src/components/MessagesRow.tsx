import PropTypes from 'prop-types';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

const propTypes = {
    /** The messages to display */
    messages: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))])),

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: PropTypes.oneOf(['error', 'success']).isRequired,

    /** A function to run when the X button next to the message is clicked */
    onClose: PropTypes.func,

    /** Additional style object for the container */
    containerStyles: stylePropTypes,

    /** Whether we can dismiss the messages */
    canDismiss: PropTypes.bool,
};

const defaultProps = {
    messages: {},
    onClose: () => {},
    containerStyles: [],
    canDismiss: true,
};

type MessagesRowProps = {
    messages: Record<string, string>;
    type: string;
    onClose: () => void;
    containerStyles: StyleProp<ViewStyle>;
    canDismiss: boolean;
};

function MessagesRow({messages = {}, type, onClose = () => {}, containerStyles = [], canDismiss = true}: MessagesRowProps) {
    const {translate} = useLocalize();
    if (Object.keys(messages).length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <DotIndicatorMessage
                style={[styles.flex1]}
                messages={messages}
                type={type}
            />
            {canDismiss && (
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
            )}
        </View>
    );
}

MessagesRow.propTypes = propTypes;
MessagesRow.defaultProps = defaultProps;
MessagesRow.displayName = 'MessagesRow';

export default MessagesRow;
