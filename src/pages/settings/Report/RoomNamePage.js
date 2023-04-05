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
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from "../../../ROUTES";
import * as ValidationUtils from "../../../libs/ValidationUtils";
import _ from "underscore/underscore-node.mjs";

const propTypes = {
    ...withLocalizePropTypes,

    /* Onyx Props */
    /** The active report */
    report: reportPropTypes.isRequired,
};

class RoomNamePage extends Component {
    constructor(props) {
        super(props);
        this.updateRoomName = this.updateRoomName.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * Submit form to update room's name
     * @param {Object} values
     * @param {String} values.roomName
     */
    updateRoomName(values) {
        RoomNameInputUtils.modifyRoomName(values.roomName);
    }

    /**
     * @param {Object} values
     * @param {String} values.roomName
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        if (_.isEmpty(values.roomName)) {
            errors.roomName = this.props.translate('common.error.fieldRequired');
        }

        return errors;
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.roomName')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getReportSettingsRoute(this.props.report.reportID))}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                    onSubmit={this.updateRoomName}
                    validate={this.validate}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="roomName"
                            name="name"
                            label={this.props.translate('newRoomPage.roomName')}
                            defaultValue={this.props.report.reportName}
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
    withReportOrNotFound,
)(RoomNamePage);
