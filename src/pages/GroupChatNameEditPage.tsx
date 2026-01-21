import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewChatNavigatorParamList} from '@libs/Navigation/types';
import {getGroupChatName} from '@libs/ReportNameUtils';
import {getGroupChatDraft} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {setGroupDraft, updateChatName} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewChatNameForm';
import type {Report as ReportOnyxType} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type GroupChatNameEditPageProps = Partial<PlatformStackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME>> & {
    report?: ReportOnyxType;
};

function GroupChatNameEditPage({report}: GroupChatNameEditPageProps) {
    // If we have a report this means we are using this page to update an existing Group Chat name
    // In this case its better to use empty string as the reportID if there is no reportID
    const reportID = report?.reportID;
    const isUpdatingExistingReport = !!reportID;
    const [groupChatDraft = getGroupChatDraft()] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {canBeMissing: true});

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const existingReportName = report ? getGroupChatName(formatPhoneNumber, undefined, false, report) : getGroupChatName(formatPhoneNumber, groupChatDraft?.participants);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currentChatName = reportID ? existingReportName : groupChatDraft?.reportName || existingReportName;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>): Errors => {
        const errors: Errors = {};
        const name = values[INPUT_IDS.NEW_CHAT_NAME] ?? '';
        const nameLength = StringUtils.getUTF8ByteLength(name.trim());
        if (nameLength > CONST.REPORT_NAME_LIMIT) {
            errors.newChatName = translate('common.error.characterLimitExceedCounter', nameLength, CONST.REPORT_NAME_LIMIT);
        }

        return errors;
    };

    const editName = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>) => {
        if (isUpdatingExistingReport) {
            if (values[INPUT_IDS.NEW_CHAT_NAME] !== currentChatName) {
                updateChatName(reportID, report.reportName, values[INPUT_IDS.NEW_CHAT_NAME] ?? '', CONST.REPORT.CHAT_TYPE.GROUP);
            }
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID)));
            return;
        }
        if (values[INPUT_IDS.NEW_CHAT_NAME] !== currentChatName) {
            setGroupDraft({reportName: values[INPUT_IDS.NEW_CHAT_NAME]});
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.NEW_CHAT_CONFIRM));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            style={[styles.defaultModalContainer]}
            testID="GroupChatNameEditPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('newRoomPage.groupName')}
                onBackButtonPress={() => Navigation.goBack(isUpdatingExistingReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID) : ROUTES.NEW_CHAT_CONFIRM)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM}
                onSubmit={editName}
                submitButtonText={translate('common.save')}
                validate={validate}
                style={[styles.mh5, styles.flex1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={TextInput}
                    defaultValue={currentChatName}
                    label={translate('common.name')}
                    accessibilityLabel={translate('common.name')}
                    inputID={INPUT_IDS.NEW_CHAT_NAME}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default GroupChatNameEditPage;
