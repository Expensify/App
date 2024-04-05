import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {NewChatNavigatorParamList} from '@navigation/types';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewChatNameForm';
import { withOnyx } from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';

type GroupChatNameEditPageProps = StackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME>;

function GroupChatNameEditPage({groupChatDraft}: GroupChatNameEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    // We will try to get the chatName from the draft if it exists there.
    const participantAccountIDs = groupChatDraft.participants.map(participant => participant.accountID);
    const currentChatName = groupChatDraft.reportName || ReportUtils.getGroupChatName(participantAccountIDs);
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>) => {
        // TODO: There is some restriction on max characters (255) not much else. We should let people set this to an empty string if they want.
        return {};
    }, []);

    const editName = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM>) => {
        Report.setGroupDraft(undefined, values[INPUT_IDS.NEW_CHAT_NAME]);
        Keyboard.dismiss();
        Navigation.goBack(ROUTES.NEW_CHAT_CONFIRM);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={GroupChatNameEditPage.displayName}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('groupConfirmPage.groupName')}
                onBackButtonPress={Navigation.goBack}
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
                    maxLength={CONST.TAG_NAME_LIMIT}
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

export default withOnyx({
    groupChatDraft: {
        key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    },
})(GroupChatNameEditPage);
