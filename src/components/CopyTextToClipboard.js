import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
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
import withLocalize, { withLocalizePropTypes } from './withLocalize';
import withDelayToggleButtonState, { withDelayToggleButtonStatePropTypes } from './withDelayToggleButtonState';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    textStyles: [],
};

const CopyTextToClipboard = ({ text, textStyles, translate, isDelayButtonStateComplete, toggleDelayButtonState }) => {
    const copyToClipboard = useCallback(() => {
        if (isDelayButtonStateComplete) {
            return;
        }
        Clipboard.setString(text);
        toggleDelayButtonState(true);
    }, [isDelayButtonStateComplete, text, toggleDelayButtonState]);

    return (
        <Text
            onPress={copyToClipboard}
            style={[styles.flexRow, styles.cursorPointer]}
            suppressHighlighting
        >
            <Text style={textStyles}>{`${text} `}</Text>
            <Tooltip text={translate(`reportActionContextMenu.${isDelayButtonStateComplete ? 'copied' : 'copyToClipboard'}`)}>
                <Pressable onPress={copyToClipboard}>
                    {({ hovered, pressed }) => (
                        <Icon
                            src={isDelayButtonStateComplete ? Expensicons.Checkmark : Expensicons.Copy}
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, isDelayButtonStateComplete))}
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
