import React, {Component} from 'react';
import TextInputWithPrefix from '../components/TextInputWithPrefix';

const propTypes = {
};


class RoomNameInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: '',
            error: '',
        }
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


export default RoomNameInput;