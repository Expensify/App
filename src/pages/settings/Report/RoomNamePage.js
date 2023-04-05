import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import TextInput from '../../../components/TextInput';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import * as RoomNameInputUtils from '../../../libs/RoomNameInputUtils';

const propTypes = {
    reportID: PropTypes.string.isRequired,
    roomName: PropTypes.string.isRequired,
    ...withLocalizePropTypes,
};

class RoomNamePage extends Component {
    constructor(props) {
        super(props);
        this.updateRoomName = this.updateRoomName.bind(this);
    }

    /**
     * Submit form to update room's name
     * @param {Object} values
     * @param {String} values.roomName
     */
    updateRoomName(values) {
        RoomNameInputUtils.modifyRoomName(values.roomName);
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.roomName')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.getReportSettingsRoute(this.props.reportID)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                    onSubmit={this.updateDisplayName}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="roomName"
                            name="name"
                            label={this.props.translate('newRoomPage.roomName')}
                            defaultValue={this.props.roomName}
                            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

RoomNamePage.propTypes = propTypes;

export default compose(
    withLocalize,
)(RoomNamePage);
