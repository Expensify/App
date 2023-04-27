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
    const updateRoomName = useCallback((values) => {
        Report.updatePolicyRoomName(report, RoomNameInputUtils.modifyRoomName(values.roomName));
        Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(report.reportID));
    }, [report]);

    const validate = useCallback((values) => {
        const errors = {};
        if (_.isEmpty(values.roomName)) {
            errors.roomName = translate('common.error.fieldRequired');
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
                onSubmit={updateRoomName}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="roomName"
                        name="name"
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
