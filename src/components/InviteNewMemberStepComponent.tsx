import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {addMembersToWorkspace, clearWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import {setWorkspaceInviteMessageDraft} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import InteractiveStepWrapper from './InteractiveStepWrapper';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import MultipleAvatars from './MultipleAvatars';
import type {AnimatedTextInputRef} from './RNTextInput';
import Text from './Text';
import TextInput from './TextInput';

type InviteNewMemberStepComponentProps = {
    // The title of the header
    title: string;

    // The function to call when the back button is pressed
    handleBackButtonPress: () => void;

    // Whether the user is editing step
    isEditing?: boolean;

    // The email address of the assignee
    assigneeEmail: string | undefined;

    // The name of the step
    stepNames: string[];

    // The account ID of the cardholder
    assigneeAccountID: number | undefined;

    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;

    // The function to call when the user wants to go to the next step
    goToNextStep: () => void;
};
function InviteNewMemberStepComponent({title, handleBackButtonPress, isEditing, assigneeEmail, assigneeAccountID, policy, goToNextStep, stepNames}: InviteNewMemberStepComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [welcomeNote, setWelcomeNote] = useState<string>();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const [workspaceInviteRoleDraft = CONST.POLICY.ROLE.USER] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, {canBeMissing: true});
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, {canBeMissing: true});
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const isOnyxLoading = isLoadingOnyxValue(workspaceInviteMessageDraftResult, formDataResult);

    const getDefaultWelcomeNote = useCallback(() => {
        return (
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            formData?.[INPUT_IDS.WELCOME_MESSAGE] ??
            // workspaceInviteMessageDraft can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            workspaceInviteMessageDraft ??
            translate('workspace.common.welcomeNote')
        );
    }, [workspaceInviteMessageDraft, translate, formData]);

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    useEffect(() => {
        if (isOnyxLoading) {
            return;
        }

        if (!isEmptyObject(assigneeEmail)) {
            setWelcomeNote(getDefaultWelcomeNote());
        }
    }, [assigneeEmail, getDefaultWelcomeNote, isOnyxLoading]);

    const sendInvitationAndGoToNextStep = () => {
        Keyboard.dismiss();
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        addMembersToWorkspace(
            {
                [assigneeEmail ?? '']: assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID,
            },
            `${welcomeNoteSubject}\n\n${welcomeNote}`,
            policyID,
            policyMemberAccountIDs,
            workspaceInviteRoleDraft,
        );
        setWorkspaceInviteMessageDraft(policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);

        goToNextStep();
    };

    useEffect(() => {
        return () => {
            clearWorkspaceInviteRoleDraft(policyID);
        };
    }, [policyID]);

    return (
        <InteractiveStepWrapper
            wrapperID={InviteNewMemberStepComponent.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={title}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.invite.inviteNewMember')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={sendInvitationAndGoToNextStep}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
            >
                <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <MultipleAvatars
                        size={CONST.AVATAR_SIZE.LARGE}
                        icons={getAvatarsForAccountIDs([Number(assigneeAccountID) || 0], allPersonalDetails ?? {}, {})}
                        shouldStackHorizontally
                        shouldDisplayAvatarsInRows
                        secondAvatarStyle={[styles.secondAvatarInline]}
                    />
                </View>
                <View style={[styles.mb5]}>
                    <Text>{translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                </View>
                <View style={[styles.mb3]}>
                    <View style={[styles.mhn5, styles.mb3]}>
                        <MenuItemWithTopDescription
                            title={translate(`workspace.common.roleName`, {role: workspaceInviteRoleDraft})}
                            description={translate('common.role')}
                            shouldShowRightIcon
                            onPress={() => {
                                Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE_ROLE.getRoute(policyID, Navigation.getActiveRoute()));
                            }}
                        />
                    </View>
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.WELCOME_MESSAGE}
                        label={translate('workspace.inviteMessage.personalMessagePrompt')}
                        accessibilityLabel={translate('workspace.inviteMessage.personalMessagePrompt')}
                        autoCompleteType="off"
                        autoCorrect={false}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        value={welcomeNote}
                        onChangeText={(text: string) => {
                            setWelcomeNote(text);
                        }}
                        ref={(element: AnimatedTextInputRef) => {
                            if (!element) {
                                return;
                            }
                            if (!inputRef.current) {
                                updateMultilineInputRange(element);
                            }
                            inputCallbackRef(element);
                        }}
                        shouldSaveDraft
                    />
                </View>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

InviteNewMemberStepComponent.displayName = 'InviteNewMemberStepComponent';

export default InviteNewMemberStepComponent;
