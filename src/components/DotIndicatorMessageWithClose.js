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
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))])),

    // The type of message, 'error' shows a red dot, 'success' shows a green dot
    type: PropTypes.oneOf(['error', 'success']).isRequired,

    /** A function to run when the X button next to the message is clicked */
    onClose: PropTypes.func,

    /** Additional style object for the container */
    containerStyles: stylePropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    messages: {},
    onClose: () => {},
    containerStyles: [],
};

function DotIndicatorMessageWithClose(props) {
    if (_.isEmpty(props.messages)) {
        return null;
    }

    return (
        <View style={StyleUtils.combineStyles(styles.flexRow, styles.alignItemsCenter, props.containerStyles)}>
            <DotIndicatorMessage
                style={[styles.flex1]}
                messages={props.messages}
                type={props.type}
            />
            <Tooltip text={props.translate('common.close')}>
                <PressableWithoutFeedback
                    onPress={props.onClose}
                    style={[styles.touchableButtonImage]}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={props.translate('common.close')}
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

export default withLocalize(DotIndicatorMessageWithClose);
