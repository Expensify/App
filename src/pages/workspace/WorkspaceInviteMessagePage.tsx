import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
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
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import * as PolicyUtils from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import * as Member from '@userActions/Policy/Member';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE>;

function WorkspaceInviteMessagePage({policy, route, currentUserPersonalDetails}: WorkspaceInviteMessagePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [welcomeNote, setWelcomeNote] = useState<string>();

    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`);
    const [workspaceInviteMessageDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${route.params.policyID.toString()}`);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    const getDefaultWelcomeNote = useCallback(() => {
        return (
            // workspaceInviteMessageDraft can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            workspaceInviteMessageDraft ||
            // policy?.description can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            Parser.htmlToMarkdown(policy?.description ?? '') ||
            translate('workspace.common.welcomeNote', {
                workspaceName: policy?.name ?? '',
            })
        );
    }, [workspaceInviteMessageDraft, policy, translate]);

    useEffect(() => {
        if (!isEmptyObject(invitedEmailsToAccountIDsDraft)) {
            setWelcomeNote(getDefaultWelcomeNote());
            return;
        }
        if (isEmptyObject(policy)) {
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID), true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isEmptyObject(invitedEmailsToAccountIDsDraft) || !welcomeNote) {
            return;
        }
        setWelcomeNote(getDefaultWelcomeNote());
    }, [getDefaultWelcomeNote, invitedEmailsToAccountIDsDraft, welcomeNote]);

    const debouncedSaveDraft = lodashDebounce((newDraft: string | null) => {
        Policy.setWorkspaceInviteMessageDraft(route.params.policyID, newDraft);
    });

    const sendInvitation = () => {
        Keyboard.dismiss();
        const policyMemberAccountIDs = Object.values(PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        Member.addMembersToWorkspace(invitedEmailsToAccountIDsDraft ?? {}, `${welcomeNoteSubject}\n\n${welcomeNote}`, route.params.policyID, policyMemberAccountIDs);
        debouncedSaveDraft(null);
        Navigation.dismissModal();
    };

    /** Opens privacy url as an external link */
    const openPrivacyURL = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        event?.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    };

    const validate = (): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> => {
        const errorFields: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> = {};
        if (isEmptyObject(invitedEmailsToAccountIDsDraft)) {
            errorFields.welcomeMessage = translate('workspace.inviteMessage.inviteNoMembersError');
        }
        return errorFields;
    };

    const policyName = policy?.name;

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils.goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceInviteMessagePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.inviteMessage.inviteMessageTitle')}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                    shouldShowBackButton
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID))}
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
                            href={CONST.PRIVACY_URL}
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
                            icons={OptionsListUtils.getAvatarsForAccountIDs(
                                Object.values(invitedEmailsToAccountIDsDraft ?? {}),
                                allPersonalDetails ?? {},
                                invitedEmailsToAccountIDsDraft ?? {},
                            )}
                            shouldStackHorizontally
                            shouldDisplayAvatarsInRows
                            secondAvatarStyle={[styles.secondAvatarInline]}
                        />
                    </View>
                    <View style={[styles.mb5]}>
                        <Text>{translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                    </View>
                    <View style={[styles.mb3]}>
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
                            defaultValue={getDefaultWelcomeNote()}
                            value={welcomeNote}
                            onChangeText={(text: string) => {
                                setWelcomeNote(text);
                                debouncedSaveDraft(text);
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
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(WorkspaceInviteMessagePage));
