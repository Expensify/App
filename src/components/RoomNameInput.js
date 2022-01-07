import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../CONST';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

import TextInputWithPrefix from './TextInputWithPrefix';

const propTypes = {
    /** Callback to execute when the text input is modified */
    onChangeText: PropTypes.func,

    /** Initial room name to show in input field. This should include the '#' already prefixed to the name */
    initialValue: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onChangeText: () => {},
    initialValue: '',
};


class RoomNameInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: props.initialValue,
            error: '',
        };
    }

    /**
     * Modifies the room name to follow our conventions:
     * - Max length 80 characters
     * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
     * - Must be lowercase
     * Also checks to see if this room name already exists, and displays an error message if so.
     * @param {String} roomName
     *
     * @returns {String}
     */
    checkAndModifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName.substring(1)
            .replace(/ /g, '_')
            .replace(/[^a-zA-Z\d_]/g, '')
            .substring(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
            .toLowerCase();
        const finalRoomName = `#${modifiedRoomNameWithoutHash}`;

        const isExistingRoomName = _.some(
            _.values(this.props.reports),
            report => report && report.policyID === this.props.report.policyID && report.reportName === finalRoomName,
        );
        if (isExistingRoomName) {
            this.setState({error: this.props.translate('newRoomPage.roomAlreadyExists')});
        } else {
            this.setState({error: ''});
        }
        return finalRoomName;
    }

    render() {
        return (
            <TextInputWithPrefix
                disabled={this.props.disabled}
                label={this.props.translate('newRoomPage.roomName')}
                prefixCharacter="#"
                placeholder={this.props.translate('newRoomPage.social')}
                containerStyles={[styles.mb5]}
                onChangeText={(roomName) => {
                    const newRoomName = this.checkAndModifyRoomName(roomName);
                    this.props.onChangeText(newRoomName);
                    this.setState({roomName: newRoomName});
                }}
                value={this.state.roomName.substring(1)}
                errorText={this.state.error}
                autoCapitalize="none"
            />
        );
    }
}

RoomNameInput.propTypes = propTypes;
RoomNameInput.defaultProps = defaultProps;


export default compose(
    withLocalize,
)(RoomNameInput);
