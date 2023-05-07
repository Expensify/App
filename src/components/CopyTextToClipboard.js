import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import getButtonState from '../libs/getButtonState';
import Icon from './Icon';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    textStyles: [],
};

const CopyTextToClipboard = (props) => {
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [showCheckmarkInterval, setShowCheckmarkInterval] = useState(null);

    useEffect(() => {
        // Clear the interval when the component unmounts so that if the user navigates
        // away quickly the App won't try to update an unmounted component state
        clearInterval(showCheckmarkInterval);
    }, []); // TODO: Check for unmount only

    const copyToClipboard = () => {
        Clipboard.setString(props.text);
        setShowCheckmark(true);
        setShowCheckmarkInterval(
            setTimeout(() => setShowCheckmark(false), 2000),
        );
    }

    return (
        <Text
            onPress={copyToClipboard}
            style={[styles.flexRow, styles.cursorPointer]}
            suppressHighlighting
        >
            <Text style={props.textStyles}>{`${props.text} `}</Text>
            <Tooltip text={props.translate(`reportActionContextMenu.${showCheckmark ? 'copied' : 'copyToClipboard'}`)}>
                <Pressable onPress={copyToClipboard}>
                    {({hovered, pressed}) => (
                        <Icon
                            src={showCheckmark ? Expensicons.Checkmark : Expensicons.Copy}
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, showCheckmark))}
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

export default withLocalize(CopyTextToClipboard);
