import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MultipleAvatars from '@components/MultipleAvatars';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
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

type InviteeNewMemberStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function InviteNewMemberStep({policy}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [welcomeNote, setWelcomeNote] = useState<string>();
    const policyID = policy?.id;
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, {
        canBeMissing: true,
    });
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isOnyxLoading = isLoadingOnyxValue(workspaceInviteMessageDraftResult, formDataResult);

    const [workspaceInviteRoleDraft = CONST.POLICY.ROLE.USER] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, {canBeMissing: true});
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

        if (!isEmptyObject(issueNewCard?.data?.assigneeEmail)) {
            setWelcomeNote(getDefaultWelcomeNote());
        }

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOnyxLoading]);

    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    const isEditing = issueNewCard?.isEditing;
    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }

        setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE,
            data: {...issueNewCard?.data, assigneeAccountID: undefined, assigneeEmail: undefined},
            isEditing: false,
            policyID,
        });
    };

    const sendInvitationAndGoToNextStep = () => {
        Keyboard.dismiss();
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        addMembersToWorkspace(
            {
                [issueNewCard?.data?.assigneeEmail ?? '']: issueNewCard?.data?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID,
            },
            `${welcomeNoteSubject}\n\n${welcomeNote}`,
            policyID,
            policyMemberAccountIDs,
            workspaceInviteRoleDraft,
        );
        setWorkspaceInviteMessageDraft(policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);

        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
        } else {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE, isEditing: false, policyID});
        }
    };

    useEffect(() => {
        return () => {
            clearWorkspaceInviteRoleDraft(policyID ?? '');
        };
    }, [policyID]);

    return (
        <InteractiveStepWrapper
            wrapperID={InviteNewMemberStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.invite.inviteNewMember')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={sendInvitationAndGoToNextStep}
                validate={() => {
                    const errorFields: FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> = {};
                    if (isEmptyObject(issueNewCard?.data.assigneeEmail)) {
                        errorFields.cardTitle = translate('workspace.inviteMessage.inviteNoMembersError');
                    }
                    return errorFields;
                }}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
            >
                <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <MultipleAvatars
                        size={CONST.AVATAR_SIZE.LARGE}
                        icons={getAvatarsForAccountIDs([Number(issueNewCard?.data.assigneeEmail) || 0], allPersonalDetails ?? {}, {})}
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

InviteNewMemberStep.displayName = 'InviteNewMemberStep';

export default InviteNewMemberStep;
