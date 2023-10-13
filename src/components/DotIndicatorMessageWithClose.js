import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import DotIndicatorMessage from './DotIndicatorMessage';
import Tooltip from './Tooltip';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import stylePropTypes from '../styles/stylePropTypes';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    // The error messages to display
    messages: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))])),

    // The type of message, 'error' shows a red dot, 'success' shows a green dot
    type: PropTypes.oneOf(['error', 'success']).isRequired,

    /** A function to run when the X button next to the message is clicked */
    onClose: PropTypes.func,

    /** Additional style object for the container */
    containerStyles: stylePropTypes,
};

const defaultProps = {
    messages: {},
    onClose: () => {},
    containerStyles: [],
};

function DotIndicatorMessageWithClose({messages, type, onClose, containerStyles}) {
    const {translate} = useLocalize();
    if (_.isEmpty(messages)) {
        return null;
    }

    return (
        <View style={StyleUtils.combineStyles(styles.flexRow, styles.alignItemsCenter, containerStyles)}>
            <DotIndicatorMessage
                style={[styles.flex1]}
                messages={messages}
                type={type}
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
    );
}

DotIndicatorMessageWithClose.propTypes = propTypes;
DotIndicatorMessageWithClose.defaultProps = defaultProps;
DotIndicatorMessageWithClose.displayName = 'DotIndicatorMessageWithClose';

export default DotIndicatorMessageWithClose;
