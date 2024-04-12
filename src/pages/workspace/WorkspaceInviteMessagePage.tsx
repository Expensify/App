import type {StackScreenProps} from '@react-navigation/stack';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import lodashDebounce from 'lodash/debounce';
import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
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
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as Link from '@userActions/Link';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceInviteMessageForm';
import type {InvitedEmailsToAccountIDs, PersonalDetailsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SearchInputManager from './SearchInputManager';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessagePageOnyxProps = {
    /** All of the personal details for everyone */
    allPersonalDetails: OnyxEntry<PersonalDetailsList>;

    /** An object containing the accountID for every invited user email */
    invitedEmailsToAccountIDsDraft: OnyxEntry<InvitedEmailsToAccountIDs>;

    /** Updated workspace invite message */
    workspaceInviteMessageDraft: OnyxEntry<string>;
};

type WorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WorkspaceInviteMessagePageOnyxProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE>;

const parser = new ExpensiMark();

function WorkspaceInviteMessagePage({workspaceInviteMessageDraft, invitedEmailsToAccountIDsDraft, policy, route, allPersonalDetails}: WorkspaceInviteMessagePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [welcomeNote, setWelcomeNote] = useState<string>();

    const {inputCallbackRef} = useAutoFocusInput();

    const getDefaultWelcomeNote = () =>
        // workspaceInviteMessageDraft can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        workspaceInviteMessageDraft ||
        // policy?.description can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        policy?.description ||
        parser.replace(
            translate('workspace.common.welcomeNote', {
                workspaceName: policy?.name ?? '',
            }),
        );

    useEffect(() => {
        if (!isEmptyObject(invitedEmailsToAccountIDsDraft)) {
            setWelcomeNote(parser.htmlToMarkdown(getDefaultWelcomeNote()));
            return;
        }
        if (isEmptyObject(policy)) {
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID), true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const debouncedSaveDraft = lodashDebounce((newDraft: string | null) => {
        Policy.setWorkspaceInviteMessageDraft(route.params.policyID, newDraft);
    });

    const sendInvitation = () => {
        Keyboard.dismiss();
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        Policy.addMembersToWorkspace(invitedEmailsToAccountIDsDraft ?? {}, welcomeNote ?? '', route.params.policyID);
        debouncedSaveDraft(null);
        SearchInputManager.searchInput = '';
        // Pop the invite message page before navigating to the members page.
        Navigation.goBack();
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(route.params.policyID));
    };

    /** Opens privacy url as an external link */
    const openPrivacyURL = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        event?.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    };

    const validate = (): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> => {
        const errorFields: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM> = {};
        if (isEmptyObject(invitedEmailsToAccountIDsDraft)) {
            errorFields.welcomeMessage = 'workspace.inviteMessage.inviteNoMembersError';
        }
        return errorFields;
    };

    const policyName = policy?.name;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceInviteMessagePage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(policy) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
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
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
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
                                inputCallbackRef(element);
                                updateMultilineInputRange(element);
                            }}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceInviteMessagePageProps, WorkspaceInviteMessagePageOnyxProps>({
        allPersonalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        invitedEmailsToAccountIDsDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
        },
        workspaceInviteMessageDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${route.params.policyID.toString()}`,
        },
    })(WorkspaceInviteMessagePage),
);
