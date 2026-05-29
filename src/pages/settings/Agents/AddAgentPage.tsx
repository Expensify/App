import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
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
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {createAgent} from '@userActions/Agent';
import {setApprovalWorkflowApprover} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken, setReturnRoute} from './pendingAgentAvatarStore';

type AddAgentPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_ADD_AGENT>;

function AddAgentPage({route}: AddAgentPageProps) {
    const policyID = route.params?.policyID;
    const workflowApproverEmail = route.params?.workflowApproverEmail;
    const isWorkflowSeedFlow = !!policyID && !!workflowApproverEmail && route.name === SCREENS.WORKSPACE.WORKFLOWS_ADD_AGENT;
    const isSetApproverSeedFlow = !!policyID && !!workflowApproverEmail && route.name === SCREENS.SETTINGS.AGENTS.ADD;
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const personalDetailsByEmail = usePersonalDetailsByEmail();
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
        let returnRoute;
        if (isWorkflowSeedFlow) {
            returnRoute = ROUTES.WORKSPACE_WORKFLOWS_ADD_AGENT.getRoute({policyID, workflowApproverEmail});
        } else if (isSetApproverSeedFlow) {
            returnRoute = ROUTES.SETTINGS_AGENTS_ADD.getRoute({policyID, workflowApproverEmail});
        } else {
            returnRoute = ROUTES.SETTINGS_AGENTS_ADD.getRoute();
        }
        setReturnRoute(returnRoute);
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

        // Pure optimistic flow — no waiting on the server, online or offline. `createAgent`
        // returns the optimistic accountID it wrote into Onyx so we can hand it to the next
        // screen and let it render the agent with opacity until CREATE_AGENT resolves.
        const {optimisticAccountID, avatarURI} = pendingFile
            ? createAgent(firstName, prompt, undefined, pendingFile.file, pendingFile.uri, policyID)
            : createAgent(firstName, prompt, botAvatarIDs.get(avatarSource as BotAvatar), undefined, undefined, policyID);

        if (isWorkflowSeedFlow && policyID && workflowApproverEmail) {
            // Drop the user on the Edit Approvers screen for the workflow they came from, with
            // the optimistic agent already seeded as approver[0]. The Edit Approvers page reads
            // the optimistic personal detail by accountID, renders it with reduced opacity
            // (via `pendingAction`), and reconciles the email/accountID once CREATE_AGENT lands.
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, workflowApproverEmail, undefined, Number(optimisticAccountID)));
            return;
        }

        if (isSetApproverSeedFlow && policyID && approvalWorkflow) {
            // Seeded from the Set Approver page: write the optimistic agent into the in-progress
            // approval workflow as approver[0] with `pendingAction = ADD`. The picker's
            // reconciliation effect upgrades the row to the real email/accountID once
            // CREATE_AGENT lands and the agent shows up in `policy.employeeList`.
            setApprovalWorkflowApprover({
                approver: {
                    email: '',
                    accountID: optimisticAccountID,
                    avatar: avatarURI,
                    displayName: firstName ?? '',
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                approverIndex: 0,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
            // Pop AddAgentPage + the Set Approver picker so the admin lands on the workflow
            // edit/create screen with the optimistic agent already chosen as approver[0]. From
            // there the Save button commits the workflow (the agent renders opaque until
            // CREATE_AGENT resolves; on failure the picker's RBR X clears the pending agent).
            if (approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT && workflowApproverEmail) {
                Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, workflowApproverEmail));
            } else {
                Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID));
            }
            return;
        }

        Navigation.goBack();
    };

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
