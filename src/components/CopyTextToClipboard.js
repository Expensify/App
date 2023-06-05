import React, {useCallback} from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import Clipboard from '../libs/Clipboard';
import getButtonState from '../libs/getButtonState';
import Icon from './Icon';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    textStyles: [],
};

const CopyTextToClipboard = (props) => {
    const copyToClipboard = useCallback(() => {
        if (props.isDelayButtonStateComplete) {
            return;
        }
        Clipboard.setString(props.text);
        props.toggleDelayButtonState(true);
    }, [props.isDelayButtonStateComplete, props.text, props.toggleDelayButtonState]);

    return (
        <Text
            onPress={copyToClipboard}
            style={[styles.flexRow, styles.cursorPointer]}
            suppressHighlighting
        >
            <Text style={props.textStyles}>{`${props.text} `}</Text>
            <Tooltip text={props.translate(`reportActionContextMenu.${props.isDelayButtonStateComplete ? 'copied' : 'copyToClipboard'}`)}>
                <Pressable onPress={copyToClipboard}>
                    {({hovered, pressed}) => (
                        <Icon
                            src={props.isDelayButtonStateComplete ? Expensicons.Checkmark : Expensicons.Copy}
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, props.isDelayButtonStateComplete))}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                            inline
                        />
                    )}
                </Pressable>
            </Tooltip>
        </Text>
    );
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;

export default compose(withLocalize, withDelayToggleButtonState)(CopyTextToClipboard);
