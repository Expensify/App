import {useIsFocused} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {shouldDisableRename} from '@libs/ReportUtils';
import {isExistingRoomName, isReservedRoomName, isValidRoomNameWithoutLimits} from '@libs/ValidationUtils';
import {updatePolicyRoomName as updatePolicyRoomNameReportAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/RoomNameForm';
import type {Report} from '@src/types/onyx';

type RoomNamePageProps = {
    report: Report;
    navigateBackTo?: Route;
};

function RoomNamePage({report, navigateBackTo}: RoomNamePageProps) {
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const isReportArchived = useReportIsArchived(report?.reportID);

    const goBack = useCallback(() => {
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(navigateBackTo));
    }, [navigateBackTo]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ROOM_NAME_FORM>) => {
            const errors = {};

            // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
            if (values.roomName === report?.reportName) {
                return errors;
            }

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                addErrorMessage(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
            } else if (!isValidRoomNameWithoutLimits(values.roomName)) {
                // We error if the room name has invalid characters
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
            } else if (isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameReservedError', values.roomName));
            } else if (isExistingRoomName(values.roomName, reports, report?.policyID)) {
                // The room name can't be set to one that already exists on the policy
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
            } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
                addErrorMessage(errors, 'roomName', translate('common.error.characterLimitExceedCounter', values.roomName.length, CONST.TITLE_CHARACTER_LIMIT));
            }

            return errors;
        },
        [report?.reportName, report?.policyID, reports, translate],
    );

    const updatePolicyRoomName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ROOM_NAME_FORM>) => {
            updatePolicyRoomNameReportAction(report, values.roomName);
            goBack();
        },
        [report, goBack],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="RoomNamePage"
        >
            <FullPageNotFoundView shouldShow={shouldDisableRename(report, isReportArchived)}>
                <HeaderWithBackButton
                    title={translate('newRoomPage.roomName')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.ROOM_NAME_FORM}
                    onSubmit={updatePolicyRoomName}
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={RoomNameInput}
                            ref={inputCallbackRef}
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

export default RoomNamePage;
