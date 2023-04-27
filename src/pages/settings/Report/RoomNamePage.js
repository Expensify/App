import React, {useCallback} from 'react';
import _ from 'underscore';
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
import * as ValidationUtils from '../../../libs/ValidationUtils'
import * as RoomNameInputUtils from '../../../libs/RoomNameInputUtils';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';

const propTypes = {
    ...withLocalizePropTypes,

    /** The room report for which the name is being edited */
    report: reportPropTypes.isRequired,
};

const RoomNamePage = (props) => {
    const report = props.report;
    const translate = props.translate;

    const validate = useCallback((values) => {
        const errors = {};

        // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
        if (values.roomName === report.reportName) {
            return errors;
        }

        if (_.isEmpty(values.roomName)) {
            // We error if the user doesn't enter a room name or left blank
            ErrorUtils.addErrorMessage(errors, 'roomName', this.props.translate('newRoomPage.pleaseEnterRoomName'));
        } else if (!ValidationUtils.isValidRoomName(values.roomName)) {
            // We error if the room name has invalid characters
            ErrorUtils.addErrorMessage(errors, 'roomName', this.props.translate('newRoomPage.roomNameInvalidError'));
        } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            ErrorUtils.addErrorMessage(errors, 'roomName', this.props.translate('newRoomPage.roomNameReservedError', {reservedName: values.roomName}));
        } else if (ValidationUtils.isExistingRoomName(values.roomName, this.props.reports, this.props.report.policyID)) {
            // The room name can't be set to one that already exists on the policy
            ErrorUtils.addErrorMessage(errors, 'roomName', this.props.translate('newRoomPage.roomAlreadyExistsError'));
        }

        return errors;
    }, [translate]);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={translate('newRoomPage.roomName')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(report.reportID))}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                onSubmit={values => Report.updatePolicyRoomNameAndNavigate(report, RoomNameInputUtils.modifyRoomName(values.roomName))}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="roomName"
                        name="name"
                        autoFocus
                        prefixCharacter={CONST.POLICY.ROOM_PREFIX}
                        label={translate('newRoomPage.roomName')}
                        defaultValue={report.reportName.substring(1)}
                        maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
};

RoomNamePage.propTypes = propTypes;
RoomNamePage.displayName = 'RoomNamePage';

export default compose(
    withLocalize,
    withReportOrNotFound,
)(RoomNamePage);
