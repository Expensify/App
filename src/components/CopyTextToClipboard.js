import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import Clipboard from '@libs/Clipboard';
import * as Expensicons from './Icon/Expensicons';
import PressableWithDelayToggle from './Pressable/PressableWithDelayToggle';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),
    urlToCopy: PropTypes.string,
    ...withLocalizePropTypes,
};

const defaultProps = {
    textStyles: [],
    urlToCopy: null,
};

function CopyTextToClipboard(props) {
    const copyToClipboard = useCallback(() => {
        Clipboard.setString(props.urlToCopy || props.text);
    }, [props.text, props.urlToCopy]);

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
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;
CopyTextToClipboard.displayName = 'CopyTextToClipboard';

export default withLocalize(CopyTextToClipboard);
