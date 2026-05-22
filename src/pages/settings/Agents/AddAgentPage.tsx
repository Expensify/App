import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {BotAvatar} from '@components/Icon/DefaultBotAvatars';
import {botAvatarIDs, botAvatars} from '@components/Icon/DefaultBotAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {createAgent} from '@userActions/Agent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken, setReturnRoute} from './pendingAgentAvatarStore';

type AddAgentPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_ADD_AGENT>;

function AddAgentPage({route}: AddAgentPageProps) {
    const policyID = route.params?.policyID;
    const workflowApproverEmail = route.params?.workflowApproverEmail;
    const isWorkflowSeedFlow = !!policyID && !!workflowApproverEmail;
    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollableLayout = useIsInLandscapeMode() || (isMobile() && windowWidth > windowHeight);
    const {displayName} = useCurrentUserPersonalDetails();
    const defaultAgentName = displayName ? translate('addAgentPage.defaultAgentName', displayName) : undefined;
    const defaultPrompt = translate('addAgentPage.defaultPrompt');
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfCenter];
    const [avatarSource, setAvatarSource] = useState<AvatarSource>(() => botAvatars[Math.floor(Math.random() * botAvatars.length)]);
    const pendingFileRef = useRef<{file: File | CustomRNImageManipulatorResult; uri: string} | null>(null);

    // Snapshot of agent account IDs at submit time. Used by the workflow-seed flow to identify
    // the freshly-created agent once CREATE_AGENT responds (any positive accountID not in this
    // snapshot is the new agent). Refs avoid re-renders and survive across form submits.
    const knownAgentAccountIDsRef = useRef<Set<number> | null>(null);
    const [isAwaitingNewAgent, setIsAwaitingNewAgent] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const pending = getPendingAvatar();
            if (!pending) {
                return;
            }
            clearPendingAvatar();

            if (pending.type === 'preset') {
                const matchingAvatar = botAvatars.find((av) => botAvatarIDs.get(av) === pending.id);
                if (matchingAvatar) {
                    setAvatarSource(() => matchingAvatar);
                }
                pendingFileRef.current = null;
            } else {
                setAvatarSource(pending.uri);
                pendingFileRef.current = {file: pending.file, uri: pending.uri};
            }
        }, []),
    );

    const handleAvatarPress = () => {
        const presetID = botAvatarIDs.get(avatarSource as BotAvatar);
        setInitialPresetID(presetID);
        setNavigationToken();
        setReturnRoute(isWorkflowSeedFlow ? ROUTES.WORKSPACE_WORKFLOWS_ADD_AGENT.getRoute({policyID, workflowApproverEmail}) : ROUTES.SETTINGS_AGENTS_ADD.getRoute());
        Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD_AVATAR);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AGENT_FORM>): Errors => {
        const errors: Errors = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AGENT_FORM>) => {
        const firstName = values[INPUT_IDS.FIRST_NAME].trim() || defaultAgentName;
        const prompt = values[INPUT_IDS.PROMPT].trim();
        const pendingFile = pendingFileRef.current;

        if (isWorkflowSeedFlow) {
            // Capture the set of agent account IDs the user already owns BEFORE the API write so the
            // effect below can identify the freshly-created agent when CREATE_AGENT responds. We use
            // a ref (instead of route params or a module store) so the snapshot is scoped to this
            // mount and disappears when the page unmounts.
            knownAgentAccountIDsRef.current = new Set(Object.keys(agentPrompts ?? {}).map((key) => Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length))));
            setIsAwaitingNewAgent(true);
        }

        if (pendingFile) {
            createAgent(firstName, prompt, undefined, pendingFile.file, pendingFile.uri, policyID);
        } else {
            createAgent(firstName, prompt, botAvatarIDs.get(avatarSource as BotAvatar), undefined, undefined, policyID);
        }

        if (!isWorkflowSeedFlow) {
            Navigation.goBack();
        }
        // For the workflow-seed flow we stay mounted with the form in its loading state and let the
        // effect below detect the new agent and navigate to the Edit Approval Workflow page once
        // the API has produced a real accountID / email.
    };

    // Watch for the freshly-created agent and, when it arrives, navigate to the Edit Approval
    // Workflow page with its real email as the approver seed.
    useEffect(() => {
        if (!isAwaitingNewAgent || !isWorkflowSeedFlow || !policyID || !workflowApproverEmail) {
            return;
        }

        const knownAccountIDs = knownAgentAccountIDsRef.current ?? new Set<number>();
        const newAgentAccountID = Object.keys(agentPrompts ?? {})
            .map((key) => Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length)))
            // Only the server-assigned (positive) accountID is a valid approver target.
            // Negative IDs come from the optimistic personal detail in `createAgent`.
            .find((accountID) => accountID > 0 && !knownAccountIDs.has(accountID));
        if (!newAgentAccountID) {
            return;
        }

        const newAgentLogin = personalDetailsList?.[newAgentAccountID]?.login;
        if (!newAgentLogin) {
            return;
        }

        setIsAwaitingNewAgent(false);
        knownAgentAccountIDsRef.current = null;
        Navigation.goBack();
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, workflowApproverEmail, newAgentLogin));
    }, [agentPrompts, personalDetailsList, isAwaitingNewAgent, isWorkflowSeedFlow, policyID, workflowApproverEmail]);

    return (
        <ScreenWrapper
            testID={AddAgentPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight={shouldUseScrollableLayout}
        >
            <HeaderWithBackButton
                title={translate('addAgentPage.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_AGENT_FORM}
                onSubmit={handleSubmit}
                validate={validate}
                submitButtonText={translate('addAgentPage.createAgent')}
                style={[styles.flex1, styles.ph5]}
                shouldUseScrollView={shouldUseScrollableLayout}
                submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
                shouldHideFixErrorsAlert
                enabledWhenOffline
                isLoading={isAwaitingNewAgent}
            >
                <View style={[styles.flex1, styles.flexColumn, styles.gap5]}>
                    <View style={[styles.alignItemsCenter]}>
                        <AvatarButtonWithIcon
                            text={translate('addAgentPage.editAvatar')}
                            source={avatarSource}
                            onPress={handleAvatarPress}
                            size={CONST.AVATAR_SIZE.X_LARGE}
                            avatarStyle={avatarStyle}
                            editIcon={expensifyIcons.Pencil}
                            editIconStyle={styles.smallEditIconAccount}
                            sentryLabel={CONST.SENTRY_LABEL.ADD_AGENT_PAGE.AVATAR}
                        />
                    </View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.FIRST_NAME}
                        label={translate('addAgentPage.agentName')}
                        accessibilityLabel={translate('addAgentPage.agentName')}
                        role={CONST.ROLE.PRESENTATION}
                        autoCapitalize="words"
                        spellCheck={false}
                        defaultValue={defaultAgentName}
                    />
                    <View style={[styles.flex1, shouldUseScrollableLayout && styles.minHeight42]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('addAgentPage.instructions')}
                            accessibilityLabel={translate('addAgentPage.instructions')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={defaultPrompt}
                            multiline
                            containerStyles={[styles.flex1]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            textInputContainerStyles={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                        />
                    </View>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

AddAgentPage.displayName = 'AddAgentPage';

export default AddAgentPage;
