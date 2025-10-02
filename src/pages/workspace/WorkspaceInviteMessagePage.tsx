import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
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
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE>;

function WorkspaceInviteMessagePage({policy, route, currentUserPersonalDetails}: WorkspaceInviteMessagePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, {canBeMissing: true});

    const viewportOffsetTop = useViewportOffsetTop();
    const [welcomeNote, setWelcomeNote] = useState<string>();

    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`, {
        canBeMissing: true,
    });
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${route.params.policyID.toString()}`, {
        canBeMissing: true,
    });
    const [workspaceInviteRoleDraft = CONST.POLICY.ROLE.USER] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${route.params.policyID.toString()}`, {canBeMissing: true});
    const isOnyxLoading = isLoadingOnyxValue(workspaceInviteMessageDraftResult, invitedEmailsToAccountIDsDraftResult, formDataResult);

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

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
        Navigation.goBack(route.params.backTo);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOnyxLoading]);

    const sendInvitation = () => {
        Keyboard.dismiss();
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        addMembersToWorkspace(
            invitedEmailsToAccountIDsDraft ?? {},
            `${welcomeNoteSubject}\n\n${welcomeNote}`,
            route.params.policyID,
            policyMemberAccountIDs,
            workspaceInviteRoleDraft,
            formatPhoneNumber,
        );
        setWorkspaceInviteMessageDraft(route.params.policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);
        if ((route.params?.backTo as string)?.endsWith('members')) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.dismissModal());
            return;
        }

        if (getIsNarrowLayout()) {
            Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(route.params.policyID), {forceReplace: true});
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.dismissModal();
            // eslint-disable-next-line deprecation/deprecation
            InteractionManager.runAfterInteractions(() => {
                Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(route.params.policyID));
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
            clearWorkspaceInviteRoleDraft(route.params.policyID);
        };
    }, [route.params.policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={WorkspaceInviteMessagePage.displayName}
                shouldEnableMaxHeight
                style={{marginTop: viewportOffsetTop}}
            >
                <HeaderWithBackButton
                    title={translate('workspace.inviteMessage.confirmDetails')}
                    subtitle={policyName}
                    shouldShowBackButton
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                    validate={validate}
                    onSubmit={sendInvitation}
                    submitButtonText={translate('common.invite')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                    footerContent={
                        <PressableWithoutFeedback
                            onPress={openPrivacyURL}
                            role={CONST.ROLE.LINK}
                            accessibilityLabel={translate('common.privacy')}
                            href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}
                            style={[styles.mv2, styles.alignSelfStart]}
                        >
                            <View style={[styles.flexRow]}>
                                <Text style={[styles.mr1, styles.label, styles.link]}>{translate('common.privacy')}</Text>
                            </View>
                        </PressableWithoutFeedback>
                    }
                >
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
                                    Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE_ROLE.getRoute(route.params.policyID, Navigation.getActiveRoute()));
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
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(WorkspaceInviteMessagePage));
