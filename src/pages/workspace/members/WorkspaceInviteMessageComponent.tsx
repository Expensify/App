import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {clearDraftValues} from '@libs/actions/FormActions';
import {openExternalLink} from '@libs/actions/Link';
import {addMembersToWorkspace, clearWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import {setWorkspaceInviteMessageDraft} from '@libs/actions/Policy/Policy';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AccessOrNotFoundWrapper from '@src/pages/workspace/AccessOrNotFoundWrapper';
import ROUTES from '@src/ROUTES';
import type {Route as Routes} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import type {PersonalDetails} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceInviteMessageComponentProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    backTo: Routes | undefined;
    currentUserPersonalDetails: OnyxEntry<PersonalDetails>;
    shouldShowTooltip?: boolean;
    shouldShowBackButton?: boolean;
    shouldShowMemberNames?: boolean;
    isInviteNewMemberStep?: boolean;
    goToNextStep?: () => void;
};

function WorkspaceInviteMessageComponent({
    policy,
    policyID,
    backTo,
    currentUserPersonalDetails,
    shouldShowTooltip = true,
    shouldShowBackButton = true,
    shouldShowMemberNames = true,
    isInviteNewMemberStep = false,
    goToNextStep,
}: WorkspaceInviteMessageComponentProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});

    const viewportOffsetTop = useViewportOffsetTop();
    const [welcomeNote, setWelcomeNote] = useState<string>();

    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {
        canBeMissing: true,
    });
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, {
        canBeMissing: true,
    });
    const [workspaceInviteRoleDraft = CONST.POLICY.ROLE.USER] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, {canBeMissing: true});
    const isOnyxLoading = isLoadingOnyxValue(workspaceInviteMessageDraftResult, invitedEmailsToAccountIDsDraftResult, formDataResult);
    const personalDetailsOfInvitedEmails = getPersonalDetailsForAccountIDs(Object.values(invitedEmailsToAccountIDsDraft ?? {}), allPersonalDetails ?? {});
    const memberNames = Object.values(personalDetailsOfInvitedEmails)
        .map((personalDetail) => {
            const displayName = getDisplayNameOrDefault(personalDetail, '', false);
            if (displayName) {
                return displayName;
            }

            // We don't have login details for users who are not in the database yet
            // So we need to fallback to their login from the invitedEmailsToAccountIDsDraft
            const accountID = personalDetail.accountID;
            const loginFromInviteMap = Object.entries(invitedEmailsToAccountIDsDraft ?? {}).find(([, id]) => id === accountID)?.[0];

            return loginFromInviteMap;
        })
        .join(', ');

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    const getDefaultWelcomeNote = useCallback(() => {
        return formData?.[INPUT_IDS.WELCOME_MESSAGE] ?? workspaceInviteMessageDraft ?? translate('workspace.common.welcomeNote');
    }, [workspaceInviteMessageDraft, translate, formData]);

    useEffect(() => {
        if (isOnyxLoading) {
            return;
        }
        if (!isEmptyObject(invitedEmailsToAccountIDsDraft)) {
            setWelcomeNote(getDefaultWelcomeNote());
            return;
        }
        if (isEmptyObject(policy)) {
            return;
        }

        if (goToNextStep) {
            setWelcomeNote(getDefaultWelcomeNote());
            return;
        }

        Navigation.goBack(backTo);

        // We only want to run this useEffect when the onyx values have loaded
        // We navigate back to the main members screen when the invitation has been sent
        // This is decided when onyx values have loaded and if `invitedEmailsToAccountIDsDraft` is empty
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOnyxLoading]);

    const sendInvitation = () => {
        Keyboard.dismiss();
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        // See https://github.com/Expensify/App/blob/main/README.md#workspace, we set conditions about who can leave the workspace
        addMembersToWorkspace(invitedEmailsToAccountIDsDraft ?? {}, `${welcomeNoteSubject}\n\n${welcomeNote}`, policyID, policyMemberAccountIDs, workspaceInviteRoleDraft, formatPhoneNumber);
        setWorkspaceInviteMessageDraft(policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);

        if (goToNextStep) {
            goToNextStep();
            return;
        }

        if ((backTo as string)?.endsWith('members')) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.dismissModal());
            return;
        }

        if (getIsNarrowLayout()) {
            Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {forceReplace: true});
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.dismissModal();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
            });
        });
    };

    /** Opens privacy url as an external link */
    const openPrivacyURL = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        event?.preventDefault();
        openExternalLink(CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL);
    };

    const validate = (): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> => {
        const errorFields: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> = {};
        if (isEmptyObject(invitedEmailsToAccountIDsDraft) && !isOnyxLoading) {
            errorFields.welcomeMessage = translate('workspace.inviteMessage.inviteNoMembersError');
        }
        return errorFields;
    };

    const policyName = policy?.name;

    useEffect(() => {
        return () => {
            clearWorkspaceInviteRoleDraft(policyID);
        };
    }, [policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={WorkspaceInviteMessageComponent.displayName}
                shouldEnableMaxHeight
                style={{marginTop: viewportOffsetTop}}
            >
                {shouldShowBackButton && (
                    <HeaderWithBackButton
                        title={translate('workspace.inviteMessage.confirmDetails')}
                        subtitle={policyName}
                        shouldShowBackButton
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                )}
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                    validate={validate}
                    onSubmit={sendInvitation}
                    submitButtonText={translate('common.invite')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    {isInviteNewMemberStep && <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.card.issueNewCard.inviteNewMember')}</Text>}
                    <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ReportActionAvatars
                            size={CONST.AVATAR_SIZE.LARGE}
                            accountIDs={Object.values(invitedEmailsToAccountIDsDraft ?? {})}
                            horizontalStacking={{
                                displayInRows: true,
                            }}
                            secondaryAvatarContainerStyle={styles.secondAvatarInline}
                            invitedEmailsToAccountIDs={invitedEmailsToAccountIDsDraft}
                            shouldUseCustomFallbackAvatar
                            shouldShowTooltip={shouldShowTooltip}
                        />
                    </View>
                    <View style={[styles.mb3]}>
                        <View style={[styles.mhn5, styles.mb3]}>
                            {shouldShowMemberNames && (
                                <MenuItemWithTopDescription
                                    title={memberNames}
                                    description={translate('common.members')}
                                    numberOfLinesTitle={2}
                                    shouldShowRightIcon
                                    onPress={() => {
                                        Navigation.goBack(backTo);
                                    }}
                                />
                            )}
                            <MenuItemWithTopDescription
                                title={translate(`workspace.common.roleName`, {role: workspaceInviteRoleDraft})}
                                description={translate('common.role')}
                                shouldShowRightIcon
                                onPress={() => {
                                    Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE_ROLE.getRoute(policyID, Navigation.getActiveRoute()));
                                }}
                            />
                        </View>
                        <View style={[styles.mb3]}>
                            <Text style={[styles.textSupportingNormal]}>{translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                        </View>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.WELCOME_MESSAGE}
                            label={translate('workspace.inviteMessage.personalMessagePrompt')}
                            accessibilityLabel={translate('workspace.inviteMessage.personalMessagePrompt')}
                            autoCompleteType="off"
                            type="markdown"
                            autoCorrect={false}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            value={welcomeNote}
                            onChangeText={(text: string) => {
                                setWelcomeNote(text);
                            }}
                            ref={(element: AnimatedTextInputRef | null) => {
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
                        <PressableWithoutFeedback
                            onPress={openPrivacyURL}
                            role={CONST.ROLE.LINK}
                            accessibilityLabel={translate('common.privacy')}
                            href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}
                            style={[styles.mt6, styles.alignSelfStart]}
                        >
                            <View style={[styles.flexRow]}>
                                <Text style={[styles.mr1, styles.label, styles.link]}>{translate('common.privacy')}</Text>
                            </View>
                        </PressableWithoutFeedback>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessageComponent.displayName = 'WorkspaceInviteMessageComponent';

export default WorkspaceInviteMessageComponent;
