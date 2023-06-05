import React from 'react';
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

class CopyTextToClipboard extends React.Component {
    constructor(props) {
        super(props);

        this.copyToClipboard = this.copyToClipboard.bind(this);
    }

    copyToClipboard() {
        Clipboard.setString(this.props.text);
    }

    render() {
        return (
            <PressableWithDelayToggle
                text={this.props.text}
                tooltipText={this.props.translate('reportActionContextMenu.copyToClipboard')}
                tooltipTextChecked={this.props.translate('reportActionContextMenu.copied')}
                icon={Expensicons.Copy}
                textStyles={this.props.textStyles}
                onPress={this.copyToClipboard}
            />
        );
    }
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;

export default withLocalize(CopyTextToClipboard);
