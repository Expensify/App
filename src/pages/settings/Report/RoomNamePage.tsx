import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
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
import type {ReportSettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RoomNameForm';
import type {Report} from '@src/types/onyx';

type RoomNamePageOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type RoomNamePageProps = RoomNamePageOnyxProps & {
    report: Report;
};

function RoomNamePage({report, reports}: RoomNamePageProps) {
    const route = useRoutePlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NAME>>();
    const styles = useThemeStyles();
    const roomNameInputRef = useRef<AnimatedTextInputRef>(null);
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const reportID = report?.reportID ?? '-1';

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, route.params.backTo));
    }, [reportID, route.params.backTo]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ROOM_NAME_FORM>) => {
            const errors = {};

            // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
            if (values.roomName === report?.reportName) {
                return errors;
            }

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
            } else if (!ValidationUtils.isValidRoomName(values.roomName)) {
                // We error if the room name has invalid characters
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
            } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameReservedError', {reservedName: values.roomName}));
            } else if (ValidationUtils.isExistingRoomName(values.roomName, reports, report?.policyID ?? '-1')) {
                // The room name can't be set to one that already exists on the policy
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
            } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('common.error.characterLimitExceedCounter', {length: values.roomName.length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            return errors;
        },
        [report, reports, translate],
    );

    const updatePolicyRoomName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ROOM_NAME_FORM>) => {
            ReportActions.updatePolicyRoomName(report, values.roomName);
            goBack();
        },
        [report, goBack],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => roomNameInputRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={RoomNamePage.displayName}
        >
            <FullPageNotFoundView shouldShow={ReportUtils.shouldDisableRename(report)}>
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

export default withOnyx<RoomNamePageProps, RoomNamePageOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(RoomNamePage);
