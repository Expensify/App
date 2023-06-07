import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import PressableWithDelayToggle from './PressableWithDelayToggle';
import Clipboard from '../libs/Clipboard';
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
    const copyToClipboard = useCallback(() => {
        Clipboard.setString(props.text);
    }, [props.text]);

    return (
        <PressableWithDelayToggle
            text={props.text}
            tooltipText={props.translate('reportActionContextMenu.copyToClipboard')}
            tooltipTextChecked={props.translate('reportActionContextMenu.copied')}
            icon={Expensicons.Copy}
            textStyles={props.textStyles}
            onPress={copyToClipboard}
        />
    );
};

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;
CopyTextToClipboard.displayName = 'CopyTextToClipboard';

export default withLocalize(CopyTextToClipboard);
