import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {clearDraftValues} from '@libs/actions/FormActions';
import {openExternalLink} from '@libs/actions/Link';
import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {setWorkspaceInviteMessageDraft} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
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
import WorkspaceMemberDetailsRoleSelectionModal from './WorkspaceMemberRoleSelectionModal';
import type {ListItemType} from './WorkspaceMemberRoleSelectionModal';

type WorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE>;

function WorkspaceInviteMessagePage({policy, route, currentUserPersonalDetails}: WorkspaceInviteMessagePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formData, formDataResult] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT);
    const [role, setRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>(CONST.POLICY.ROLE.USER);

    const viewportOffsetTop = useViewportOffsetTop();
    const [welcomeNote, setWelcomeNote] = useState<string>();

    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`);
    const [workspaceInviteMessageDraft, workspaceInviteMessageDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${route.params.policyID.toString()}`);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const isOnyxLoading = isLoadingOnyxValue(workspaceInviteMessageDraftResult, invitedEmailsToAccountIDsDraftResult, formDataResult);

    const [isRoleSelectionModalVisible, setIsRoleSelectionModalVisible] = useState(false);

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    const openRoleSelectionModal = useCallback(() => {
        setIsRoleSelectionModalVisible(true);
    }, []);

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
        addMembersToWorkspace(invitedEmailsToAccountIDsDraft ?? {}, `${welcomeNoteSubject}\n\n${welcomeNote}`, route.params.policyID, policyMemberAccountIDs, role);
        setWorkspaceInviteMessageDraft(route.params.policyID, welcomeNote ?? null);
        clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);
        if ((route.params?.backTo as string)?.endsWith('members')) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.dismissModal());
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.dismissModal();
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

    const roleItems: ListItemType[] = useMemo(
        () => [
            {
                value: CONST.POLICY.ROLE.ADMIN,
                text: translate('common.admin'),
                alternateText: translate('workspace.common.adminAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.ADMIN,
            },
            {
                value: CONST.POLICY.ROLE.AUDITOR,
                text: translate('common.auditor'),
                alternateText: translate('workspace.common.auditorAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.AUDITOR,
                keyForList: CONST.POLICY.ROLE.AUDITOR,
            },
            {
                value: CONST.POLICY.ROLE.USER,
                text: translate('common.member'),
                alternateText: translate('workspace.common.memberAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.USER,
                keyForList: CONST.POLICY.ROLE.USER,
            },
        ],
        [role, translate],
    );

    const changeRole = useCallback(({value}: ListItemType) => {
        setIsRoleSelectionModalVisible(false);
        setRole(value);
    }, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
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
                        <MultipleAvatars
                            size={CONST.AVATAR_SIZE.LARGE}
                            icons={getAvatarsForAccountIDs(Object.values(invitedEmailsToAccountIDsDraft ?? {}), allPersonalDetails ?? {}, invitedEmailsToAccountIDsDraft ?? {})}
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
                                title={translate(`workspace.common.roleName`, {role})}
                                description={translate('common.role')}
                                shouldShowRightIcon
                                onPress={openRoleSelectionModal}
                            />
                            <WorkspaceMemberDetailsRoleSelectionModal
                                isVisible={isRoleSelectionModalVisible}
                                items={roleItems}
                                onRoleChange={changeRole}
                                onClose={() => setIsRoleSelectionModalVisible(false)}
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
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(WorkspaceInviteMessagePage));
