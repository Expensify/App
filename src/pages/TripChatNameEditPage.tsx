import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewChatNavigatorParamList} from '@libs/Navigation/types';
import {getReportName} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {isValidReportName} from '@libs/ValidationUtils';
import {updateChatName} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewChatNameForm';
import type {Report} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type TripChatNameEditPageProps = Partial<PlatformStackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME>> & {
    report: Report;
};

function TripChatNameEditPage({report}: TripChatNameEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const reportID = report?.reportID;
    const currentChatName = getReportName(report);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>): Errors => {
            const errors: Errors = {};
            if (!isValidReportName(values[INPUT_IDS.NEW_CHAT_NAME] ?? '')) {
                errors.newChatName = translate('common.error.characterLimit', {limit: CONST.REPORT_NAME_LIMIT});
            }

            if (StringUtils.isEmptyString(values[INPUT_IDS.NEW_CHAT_NAME] ?? '')) {
                errors.newChatName = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const editName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>) => {
            if (values[INPUT_IDS.NEW_CHAT_NAME] !== currentChatName) {
                updateChatName(reportID, values[INPUT_IDS.NEW_CHAT_NAME] ?? '', CONST.REPORT.CHAT_TYPE.TRIP_ROOM);
            }

            return Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID)));
        },
        [reportID, currentChatName],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            style={[styles.defaultModalContainer]}
            testID={TripChatNameEditPage.displayName}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('newRoomPage.roomName')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID))}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM}
                onSubmit={editName}
                submitButtonText={translate('common.save')}
                validate={validate}
                style={[styles.mh5, styles.flex1]}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={TextInput}
                    maxLength={CONST.REPORT_NAME_LIMIT}
                    defaultValue={currentChatName}
                    label={translate('common.name')}
                    accessibilityLabel={translate('common.name')}
                    inputID={INPUT_IDS.NEW_CHAT_NAME}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                    shouldShowClearButton
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

TripChatNameEditPage.displayName = 'TripChatNameEditPage';

export default TripChatNameEditPage;
