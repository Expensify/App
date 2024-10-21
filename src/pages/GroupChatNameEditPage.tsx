import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewChatNameForm';
import type {Report as ReportOnyxType} from '@src/types/onyx';
import type NewGroupChatDraft from '@src/types/onyx/NewGroupChatDraft';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type GroupChatNameEditPageOnyxProps = {
    groupChatDraft: OnyxEntry<NewGroupChatDraft>;
};

type GroupChatNameEditPageProps = GroupChatNameEditPageOnyxProps &
    Partial<PlatformStackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME>> & {
        report?: ReportOnyxType;
    };

function GroupChatNameEditPage({groupChatDraft, report}: GroupChatNameEditPageProps) {
    // If we have a report this means we are using this page to update an existing Group Chat name
    // In this case its better to use empty string as the reportID if there is no reportID
    const reportID = report?.reportID ?? '';
    const isUpdatingExistingReport = !!reportID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const existingReportName = useMemo(
        () => (report ? ReportUtils.getGroupChatName(undefined, false, report) : ReportUtils.getGroupChatName(groupChatDraft?.participants)),
        [groupChatDraft?.participants, report],
    );
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currentChatName = reportID ? existingReportName : groupChatDraft?.reportName || existingReportName;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>): Errors => {
            const errors: Errors = {};
            if (!ValidationUtils.isValidReportName(values[INPUT_IDS.NEW_CHAT_NAME] ?? '')) {
                errors.newChatName = translate('common.error.characterLimit', {limit: CONST.REPORT_NAME_LIMIT});
            }

            return errors;
        },
        [translate],
    );

    const editName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>) => {
            if (isUpdatingExistingReport) {
                if (values[INPUT_IDS.NEW_CHAT_NAME] !== currentChatName) {
                    Report.updateGroupChatName(reportID, values[INPUT_IDS.NEW_CHAT_NAME] ?? '');
                }
                Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
                return;
            }
            if (values[INPUT_IDS.NEW_CHAT_NAME] !== currentChatName) {
                Report.setGroupDraft({reportName: values[INPUT_IDS.NEW_CHAT_NAME]});
            }
            Navigation.goBack(ROUTES.NEW_CHAT_CONFIRM);
        },
        [isUpdatingExistingReport, reportID, currentChatName],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={GroupChatNameEditPage.displayName}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('groupConfirmPage.groupName')}
                onBackButtonPress={() => Navigation.goBack(isUpdatingExistingReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID) : ROUTES.NEW_CHAT_CONFIRM)}
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

GroupChatNameEditPage.displayName = 'GroupChatNameEditPage';

export default withOnyx<GroupChatNameEditPageProps, GroupChatNameEditPageOnyxProps>({
    groupChatDraft: {
        key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    },
})(GroupChatNameEditPage);
