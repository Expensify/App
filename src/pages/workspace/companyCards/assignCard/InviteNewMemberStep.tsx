import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MultipleAvatars from '@components/MultipleAvatars';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {addMembersToWorkspace, clearWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import {setWorkspaceInviteMessageDraft} from '@libs/actions/Policy/Policy';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type InviteNewMemberStepProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    feed: OnyxTypes.CompanyCardFeed;
};

function InviteNewMemberStep({policy, feed}: InviteNewMemberStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [welcomeNote, setWelcomeNote] = useState<string>();
    const policyID = policy?.id;

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, {canBeMissing: true});
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, {canBeMissing: true});
    const [workspaceInviteRoleDraft = CONST.POLICY.ROLE.USER] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});

    const [list] = useCardsList(policy?.id, feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed]);
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

        if (!isEmptyObject(assignCard?.data?.email)) {
            setWelcomeNote(getDefaultWelcomeNote());
        }
    }, [assignCard?.data?.email, getDefaultWelcomeNote, isOnyxLoading]);

    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const isEditing = assignCard?.isEditing;

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION, isEditing: false});
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                data: {
                    ...assignCard?.data,
                    assigneeAccountID: undefined,
                    email: undefined,
                },
                isEditing: false,
            });
        }
    };

    const sendInvitationAndGoToNextStep = () => {
        Keyboard.dismiss();
        const memberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));

        addMembersToWorkspace(
            {
                [assignCard?.data?.email ?? '']: assignCard?.data?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID,
            },
            `${welcomeNoteSubject}\n\n${welcomeNote}`,
            policyID,
            memberAccountIDs,
            workspaceInviteRoleDraft,
        );

        setWorkspaceInviteMessageDraft(policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);

        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        const data: Partial<AssignCardData> = {
            email: assignCard?.data?.email,
            cardName: getDefaultCardName(assignCard?.data?.email),
        };

        if (hasOnlyOneCardToAssign(filteredCardList)) {
            nextStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
        }

        setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
            data,
            isEditing: false,
        });
    };

    useEffect(() => {
        return () => {
            clearWorkspaceInviteRoleDraft(policyID);
        };
    }, [policyID]);

    return (
        <InteractiveStepWrapper
            wrapperID={InviteNewMemberStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.companyCards.assignCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.whoNeedsCardAssigned')}</Text>

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
                        icons={getAvatarsForAccountIDs([Number(assignCard?.data?.email) || 0], allPersonalDetails ?? {}, {})}
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
                            title={translate('workspace.common.roleName', {role: workspaceInviteRoleDraft})}
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
                        onChangeText={setWelcomeNote}
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
