import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RoomNameForm';
import type {Policy, Report} from '@src/types/onyx';

type RoomNamePageOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;

    /** Policy of the report for which the name is being edited */
    policy: OnyxEntry<Policy>;
};

type RoomNamePageProps = RoomNamePageOnyxProps & WithReportOrNotFoundProps & StackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOM_NAME>;

function RoomNamePage({report, policy, reports}: RoomNamePageProps) {
    const styles = useThemeStyles();
    const roomNameInputRef = useRef<AnimatedTextInputRef>(null);
    const isFocused = useIsFocused();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ROOM_NAME_FORM>) => {
            const errors = {};

            // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
            if (values.roomName === report?.reportName) {
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
            } else if (ValidationUtils.isExistingRoomName(values.roomName, reports, report?.policyID ?? '')) {
                // The room name can't be set to one that already exists on the policy
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomAlreadyExistsError');
            } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
                ErrorUtils.addErrorMessage(errors, 'roomName', ['common.error.characterLimitExceedCounter', {length: values.roomName.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
            }

            return errors;
        },
        [report, reports],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => roomNameInputRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={RoomNamePage.displayName}
        >
            <FullPageNotFoundView shouldShow={ReportUtils.shouldDisableRename(report, policy)}>
                <HeaderWithBackButton
                    title={translate('newRoomPage.roomName')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID ?? ''))}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                    onSubmit={(values) => report && ReportActions.updatePolicyRoomNameAndNavigate(report, values.roomName)}
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={RoomNameInput}
                            ref={roomNameInputRef}
                            inputID={INPUT_IDS.ROOM_NAME}
                            defaultValue={report?.reportName}
                            isFocused={isFocused}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomNamePage.displayName = 'RoomNamePage';

export default withReportOrNotFound()(
    withOnyx<RoomNamePageProps, RoomNamePageOnyxProps>({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
        },
    })(RoomNamePage),
);
