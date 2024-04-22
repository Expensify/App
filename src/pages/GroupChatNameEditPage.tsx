import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
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
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {NewChatNavigatorParamList} from '@navigation/types';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewChatNameForm';
import type NewGroupChatDraft from '@src/types/onyx/NewGroupChatDraft';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type GroupChatNameEditPageOnyxProps = {
    groupChatDraft: NewGroupChatDraft | null;
};

type GroupChatNameEditPageProps = StackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME> & GroupChatNameEditPageOnyxProps;

function GroupChatNameEditPage({groupChatDraft, route}: GroupChatNameEditPageProps) {
    // If we have a reportID this means we are using this page to update an existing Group Chat name
    const reportID = route.params?.reportID ?? '';
    const isUpdatingExistingReport = Boolean(reportID);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    // We will try to get the chatName from the report or draft depending on what flow we are in
    const participantAccountIDs = useMemo(() => {
        if (reportID) {
            return ReportUtils.getParticipantAccountIDs(reportID);
        }

        return (groupChatDraft?.participants ?? []).map((participant) => participant.accountID);
    }, [groupChatDraft, reportID]);
    const existingReportName = useMemo(() => ReportUtils.getGroupChatName(participantAccountIDs, false, reportID), [participantAccountIDs, reportID]);
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
                Report.updateGroupChatName(reportID, values[INPUT_IDS.NEW_CHAT_NAME] ?? '');
                Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
                return;
            }

            Report.setGroupDraft({reportName: values[INPUT_IDS.NEW_CHAT_NAME]});
            Navigation.goBack(ROUTES.NEW_CHAT_CONFIRM);
        },
        [isUpdatingExistingReport, reportID],
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
                onBackButtonPress={() => Navigation.goBack(isUpdatingExistingReport ? ROUTES.REPORT_SETTINGS.getRoute(reportID) : ROUTES.NEW_CHAT_CONFIRM)}
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
