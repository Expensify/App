import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,

    /** The room report for which the name is being edited */
    report: reportPropTypes.isRequired,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Policy of the report for which the name is being edited */
    policy: PropTypes.shape({
        role: PropTypes.string,
        owner: PropTypes.string,
    }),
};
const defaultProps = {
    reports: {},
    policy: {},
};

function RoomNamePage({policy, report, reports, translate}) {
    const styles = useThemeStyles();
    const roomNameInputRef = useRef(null);
    const isFocused = useIsFocused();

    const validate = useCallback(
        (values) => {
            const errors = {};

            // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
            if (values.roomName === report.reportName) {
                return errors;
            }

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.pleaseEnterRoomName');
            } else if (!ValidationUtils.isValidRoomName(values.roomName)) {
                // We error if the room name has invalid characters
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomNameInvalidError');
            } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', ['newRoomPage.roomNameReservedError', {reservedName: values.roomName}]);
            } else if (ValidationUtils.isExistingRoomName(values.roomName, reports, report.policyID)) {
                // The room name can't be set to one that already exists on the policy
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomAlreadyExistsError');
            }

            return errors;
        },
        [report, reports],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => roomNameInputRef.current && roomNameInputRef.current.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={RoomNamePage.displayName}
        >
            <FullPageNotFoundView shouldShow={ReportUtils.shouldDisableRename(report, policy)}>
                <HeaderWithBackButton
                    title={translate('newRoomPage.roomName')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID))}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                    onSubmit={(values) => Report.updatePolicyRoomNameAndNavigate(report, values.roomName)}
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <RoomNameInput
                            ref={roomNameInputRef}
                            inputID="roomName"
                            defaultValue={report.reportName}
                            isFocused={isFocused}
                            roomName={report.reportName.slice(1)}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomNamePage.propTypes = propTypes;
RoomNamePage.defaultProps = defaultProps;
RoomNamePage.displayName = 'RoomNamePage';

export default compose(
    withLocalize,
    withReportOrNotFound(),
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(RoomNamePage);
