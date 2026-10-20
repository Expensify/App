import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import {getAssignableWorkspaceMemberRoleItems} from '@components/WorkspaceMemberRoleList';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {buildFileFromAvatarCropResult} from '@libs/AvatarCropUtils';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {clearNewAgentAvatarDraft, clearNewAgentTemplate, createAgent, createCompanyAgent, setNewAgentAvatarPreset} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type NewAgentTemplate from '@src/types/onyx/NewAgentTemplate';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {TextInputKeyPressEvent} from 'react-native';

import React, {useCallback, useEffect, useRef} from 'react';
import {Platform, View} from 'react-native';

import {PROMPT_MAX_AUTO_GROW_HEIGHT, PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE} from './const';
import scrollToMultilineInput from './scrollToMultilineInput';

type DynamicAddAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_ADD>;

type DynamicAddAgentPageContentProps = {
    /** Route params (policyID) forwarded from the screen */
    route: DynamicAddAgentPageProps['route'];

    /** Template picked in the "New agent" screen used to pre-fill the fields, or undefined for a blank agent */
    template: NewAgentTemplate | undefined;
};

function DynamicAddAgentPageContent({route, template}: DynamicAddAgentPageContentProps) {
    const StyleUtils = useStyleUtils();
    const policy = usePolicy(route.params?.policyID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);
    // On native portrait the prompt grows with its content up to a max height instead of filling the screen, so the open
    // keyboard can't squeeze it or hide the line being edited, and the form scrolls to fit it above the keyboard.
    const shouldAutoGrowPromptInput = Platform.OS !== 'web' && !isInLandscapeMode;
    const shouldUseScrollableLayout = shouldAutoGrowPromptInput || isInLandscapeMode;
    const shouldShrinkPromptInput = isInLandscapeMode && isKeyboardActive;
    const {accountID: currentUserAccountID, login: currentUserLogin, displayName} = useCurrentUserPersonalDetails();
    const defaultAgentName = template?.name ?? (displayName ? translate('addAgentPage.defaultAgentName', displayName) : undefined);
    const defaultPrompt = template?.prompt ?? translate('addAgentPage.defaultPrompt');
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const [avatarDraft, avatarDraftMetadata] = useOnyx(ONYXKEYS.AGENT_NEW_AVATAR_DRAFT);
    const isDraftLoading = isLoadingOnyxValue(avatarDraftMetadata);
    const hasSubmittedRef = useRef(false);
    const hasLeftPageRef = useRef(false);
    const formRef = useRef<FormRef>(null);
    const availableRoleItems = getAssignableWorkspaceMemberRoleItems(translate, undefined, policy, currentUserLogin ?? '');
    const defaultRole = availableRoleItems.at(0)?.value;
    const roleOptions = availableRoleItems.map((roleItem) => ({
        label: roleItem.text,
        value: roleItem.value,
        description: roleItem.alternateText,
    }));
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.AGENT_ADD.path);

    const submitFormOnModEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event)) {
            return;
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            // The markdown input inserts a line break for any Enter keydown whose default is not already prevented, so the submit combo has to claim it first.
            event.preventDefault();
            formRef.current?.submit();
        }
    };

    const uploadedAvatar = avatarDraft?.uploadedAvatar;
    const selectedPresetID = avatarDraft?.customExpensifyAvatarID && AGENT_AVATARS.isAvatarID(avatarDraft.customExpensifyAvatarID) ? avatarDraft.customExpensifyAvatarID : undefined;

    // Seed the avatar once and persist it, so the same avatar is shown on every screen and survives a page
    // refresh anywhere in the add flow (including a refresh on the crop screen and back). When the builder was
    // opened from a template, seed the template's avatar; otherwise fall back to a random preset.
    const hasSeededRef = useRef(false);
    useEffect(() => {
        if (hasSeededRef.current || isDraftLoading || avatarDraft) {
            return;
        }
        hasSeededRef.current = true;
        const seedID = template && AGENT_AVATARS.isAvatarID(template.avatarID) ? template.avatarID : AGENT_AVATARS.getRandomID();
        if (seedID) {
            setNewAgentAvatarPreset(seedID);
        }
    }, [isDraftLoading, avatarDraft, template]);

    let avatarSource: AvatarSource = '';
    if (uploadedAvatar?.uri) {
        avatarSource = uploadedAvatar.uri;
    } else if (selectedPresetID) {
        avatarSource = AGENT_AVATARS.getLocal(selectedPresetID) ?? '';
    }

    // Reset the draft when the add flow is dismissed without creating the agent, so the next session starts fresh.
    useBeforeRemove(
        useCallback(() => {
            hasLeftPageRef.current = true;
            if (hasSubmittedRef.current || !avatarDraft) {
                return;
            }
            clearNewAgentAvatarDraft();
        }, [avatarDraft]),
    );

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AGENT_FORM>): Errors => {
        const errors: Errors = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        if (!values[INPUT_IDS.ROLE]) {
            errors[INPUT_IDS.ROLE] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AGENT_FORM>) => {
        hasSubmittedRef.current = true;
        const firstName = values[INPUT_IDS.FIRST_NAME].trim() || defaultAgentName;
        const prompt = values[INPUT_IDS.PROMPT].trim();
        const role = values[INPUT_IDS.ROLE];

        // Pure optimistic flow: `createAgent/createCompanyAgent` writes the agent and the owner<->agent DM to Onyx under a
        // reportID it generates client-side, and CreateAgent/CreateCompanyAgent creates the DM under that exact ID,
        // so we can navigate to the DM immediately, online or offline, without waiting.
        let optimisticReportID: string | undefined;
        let optimisticPersonalDetailPromise: Promise<void> | undefined;
        let backToAgentsListRoute: Route | undefined;

        if (policy) {
            const result = uploadedAvatar?.uri
                ? createCompanyAgent(currentUserAccountID, currentUserLogin, prompt, policy, role, firstName, undefined, buildFileFromAvatarCropResult(uploadedAvatar), uploadedAvatar.uri)
                : createCompanyAgent(currentUserAccountID, currentUserLogin, prompt, policy, role, firstName, selectedPresetID ?? AGENT_AVATARS.getRandomID());
            optimisticReportID = result.optimisticReportID;
            optimisticPersonalDetailPromise = result.optimisticPersonalDetailPromise;
            backToAgentsListRoute = ROUTES.WORKSPACE_AGENTS.getRoute(policy.id);
        } else {
            const result = uploadedAvatar?.uri
                ? createAgent(firstName, prompt, currentUserAccountID, currentUserLogin, undefined, buildFileFromAvatarCropResult(uploadedAvatar), uploadedAvatar.uri)
                : createAgent(firstName, prompt, currentUserAccountID, currentUserLogin, selectedPresetID ?? AGENT_AVATARS.getRandomID(), undefined, undefined);
            optimisticReportID = result.optimisticReportID;
            optimisticPersonalDetailPromise = result.optimisticPersonalDetailPromise;
            backToAgentsListRoute = ROUTES.SETTINGS_AGENTS;
        }

        clearNewAgentTemplate();

        // Not useResponsiveLayout: this page itself lives inside the RHP modal stack, so
        // shouldUseNarrowLayout/isSmallScreenWidth from that hook would always read as "narrow"
        // regardless of window size. getIsNarrowLayout() reflects the actual window width.
        const isNarrowLayout = getIsNarrowLayout();

        optimisticPersonalDetailPromise.then(() => {
            // The user left the builder before the write resolved, so don't pull them into the DM from whatever screen is now active.
            if (hasLeftPageRef.current) {
                clearNewAgentAvatarDraft();
                return;
            }

            if (isNarrowLayout) {
                // Reveal the DM under the modal before dismissing so we navigate directly to it in one animation,
                // instead of dismissing to the agents list first and navigating to the DM afterward.
                Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(optimisticReportID, undefined, undefined, backToAgentsListRoute), {
                    afterTransition: () => {
                        clearNewAgentAvatarDraft();
                    },
                });
                return;
            }

            // On wide layouts, open the DM in a dedicated RHP screen instead of the fullscreen report split.
            // forceReplace swaps this screen out for the DM instead of pushing on top of it, so the
            // already-submitted form can't be reached again via the close/back button.
            Navigation.navigate(ROUTES.AGENT_REPORT.getRoute(optimisticReportID), {
                forceReplace: true,
                afterTransition: () => {
                    clearNewAgentAvatarDraft();
                },
            });
        });
    };

    const promptTopOffsetRef = useRef(0);
    const handleInputFocus = () => scrollToMultilineInput(formRef, shouldUseScrollableLayout, promptTopOffsetRef.current);

    const agentAvatar = avatarSource ? (
        <UserAvatar
            source={avatarSource}
            size={CONST.AVATAR_SIZE.XXXX_LARGE}
            accountID={CONST.DEFAULT_NUMBER_ID}
        />
    ) : null;

    return (
        <ScreenWrapper
            testID={DynamicAddAgentPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight={shouldAutoGrowPromptInput}
        >
            <CollapsibleHeaderOnKeyboard>
                <HeaderWithBackButton
                    title={translate('addAgentPage.title')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
            </CollapsibleHeaderOnKeyboard>
            <FormProvider
                ref={formRef}
                formID={ONYXKEYS.FORMS.ADD_AGENT_FORM}
                onSubmit={handleSubmit}
                validate={validate}
                submitButtonText={translate('addAgentPage.createAgent')}
                style={[styles.flex1, styles.ph5]}
                shouldUseScrollView={shouldUseScrollableLayout}
                submitFlexEnabled={false}
                shouldHideFixErrorsAlert
                enabledWhenOffline
                // Block submit until the draft has loaded, so we never create the agent without the preset/photo it will restore.
                isSubmitDisabled={isDraftLoading}
            >
                <View style={[styles.flex1, styles.flexColumn, styles.gap5]}>
                    <View style={[styles.alignItemsCenter]}>
                        <AvatarButtonWithIcon
                            text={translate('addAgentPage.editAvatar')}
                            avatar={agentAvatar}
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_ADD_AVATAR.getRoute()))}
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
                    {!!policy && (
                        <View style={[styles.mhn5]}>
                            <InputWrapper
                                InputComponent={ValuePicker}
                                inputID={INPUT_IDS.ROLE}
                                label={translate('common.role')}
                                items={roleOptions}
                                defaultValue={defaultRole}
                                shouldShowTooltips={false}
                            />
                        </View>
                    )}
                    <View
                        style={
                            shouldShrinkPromptInput
                                ? StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE)
                                : [isInLandscapeMode && styles.h42, !isInLandscapeMode && !shouldAutoGrowPromptInput && styles.flex1]
                        }
                        onLayout={(event) => {
                            promptTopOffsetRef.current = event.nativeEvent.layout.y;
                        }}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('addAgentPage.instructions')}
                            accessibilityLabel={translate('addAgentPage.instructions')}
                            role={CONST.ROLE.PRESENTATION}
                            type="markdown"
                            excludedMarkdownStyles={['mentionReport']}
                            onKeyPress={submitFormOnModEnter}
                            defaultValue={defaultPrompt}
                            multiline
                            autoGrowHeight={shouldAutoGrowPromptInput}
                            maxAutoGrowHeight={shouldAutoGrowPromptInput ? PROMPT_MAX_AUTO_GROW_HEIGHT : undefined}
                            containerStyles={shouldAutoGrowPromptInput ? undefined : [styles.h100]}
                            touchableInputWrapperStyle={shouldAutoGrowPromptInput ? undefined : [styles.flex1]}
                            inputStyle={[!shouldAutoGrowPromptInput && styles.flex1, styles.textAlignVerticalTop]}
                            onFocus={handleInputFocus}
                        />
                    </View>
                    <Text style={[styles.textLabelSupporting]}>{`${translate('addAgentPage.copilotNote')} ${translate('workspace.rules.agentRules.disclaimer')}`}</Text>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

function DynamicAddAgentPage({route}: DynamicAddAgentPageProps) {
    const [template, templateMetadata] = useOnyx(ONYXKEYS.NEW_AGENT_TEMPLATE);

    if (isLoadingOnyxValue(templateMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <DynamicAddAgentPageContent
            route={route}
            template={template}
        />
    );
}

DynamicAddAgentPage.displayName = 'DynamicAddAgentPage';

export default DynamicAddAgentPage;
