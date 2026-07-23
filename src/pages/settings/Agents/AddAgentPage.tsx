import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {buildFileFromAvatarCropResult} from '@libs/AvatarCropUtils';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import {isMobile} from '@libs/Browser';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {clearNewAgentAvatarDraft, createAgent, setNewAgentAvatarPreset} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

type AddAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function AddAgentPage({route}: AddAgentPageProps) {
    const policyID = route.params?.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollableLayout = useIsInLandscapeMode() || (isMobile() && windowWidth > windowHeight);
    const {accountID: ownerAccountID, login: ownerLogin, displayName} = useCurrentUserPersonalDetails();
    const defaultAgentName = displayName ? translate('addAgentPage.defaultAgentName', displayName) : undefined;
    const defaultPrompt = translate('addAgentPage.defaultPrompt');
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfCenter];
    const [avatarDraft, avatarDraftMetadata] = useOnyx(ONYXKEYS.AGENT_NEW_AVATAR_DRAFT);
    const isDraftLoading = isLoadingOnyxValue(avatarDraftMetadata);
    const hasSubmittedRef = useRef(false);

    const uploadedAvatar = avatarDraft?.uploadedAvatar;
    const selectedPresetID = avatarDraft?.customExpensifyAvatarID && AGENT_AVATARS.isAvatarID(avatarDraft.customExpensifyAvatarID) ? avatarDraft.customExpensifyAvatarID : undefined;

    // Seed a random fallback avatar once and persist it, so the same avatar is shown on every screen and
    // survives a page refresh anywhere in the add flow (including a refresh on the crop screen and back).
    const hasSeededRef = useRef(false);
    useEffect(() => {
        if (hasSeededRef.current || isDraftLoading || avatarDraft) {
            return;
        }
        hasSeededRef.current = true;
        const randomID = AGENT_AVATARS.getRandomID();
        if (randomID) {
            setNewAgentAvatarPreset(randomID);
        }
    }, [isDraftLoading, avatarDraft]);

    let avatarSource: AvatarSource = '';
    if (uploadedAvatar?.uri) {
        avatarSource = uploadedAvatar.uri;
    } else if (selectedPresetID) {
        avatarSource = AGENT_AVATARS.getLocal(selectedPresetID) ?? '';
    }

    // Reset the draft when the add flow is dismissed without creating the agent, so the next session starts fresh.
    useBeforeRemove(
        useCallback(() => {
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
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AGENT_FORM>) => {
        hasSubmittedRef.current = true;
        const firstName = values[INPUT_IDS.FIRST_NAME].trim() || defaultAgentName;
        const prompt = values[INPUT_IDS.PROMPT].trim();

        // Pure optimistic flow: `createAgent` writes the agent and the owner<->agent DM to Onyx under a
        // reportID it generates client-side, and CreateAgent creates the DM under that exact ID (see
        // CreateAgent.cpp), so we can navigate to the DM immediately, online or offline, without waiting.
        const {optimisticReportID} = uploadedAvatar?.uri
            ? createAgent(firstName, prompt, ownerAccountID, ownerLogin, undefined, buildFileFromAvatarCropResult(uploadedAvatar), uploadedAvatar.uri, policyID)
            : createAgent(firstName, prompt, ownerAccountID, ownerLogin, selectedPresetID ?? AGENT_AVATARS.getRandomID(), undefined, undefined, policyID);

        clearNewAgentAvatarDraft();

        // Not useResponsiveLayout: this page itself lives inside the RHP modal stack, so
        // shouldUseNarrowLayout/isSmallScreenWidth from that hook would always read as "narrow"
        // regardless of window size. getIsNarrowLayout() reflects the actual window width.
        if (getIsNarrowLayout()) {
            // Reveal the DM under the modal before dismissing so we navigate directly to it in one animation,
            // instead of dismissing to the agents list first and navigating to the DM afterward.
            Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(optimisticReportID));
            return;
        }

        // On wide layouts, open the DM in a dedicated RHP screen instead of the fullscreen report split.
        // No explicit dismiss needed: navigating to another side-modal route while one is open replaces
        // it in a single transition (see isNavigatingToModalFromModal in RootStackRouter.ts).
        Navigation.navigate(ROUTES.AGENT_REPORT.getRoute(optimisticReportID));
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
                // Block submit until the draft has loaded, so we never create the agent without the preset/photo it will restore.
                isSubmitDisabled={isDraftLoading}
            >
                <View style={[styles.flex1, styles.flexColumn, styles.gap5]}>
                    <View style={[styles.alignItemsCenter]}>
                        <AvatarButtonWithIcon
                            text={translate('addAgentPage.editAvatar')}
                            source={avatarSource}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD_AVATAR)}
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
                    <Text style={[styles.textLabelSupporting]}>{translate('addAgentPage.copilotNote')}</Text>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

AddAgentPage.displayName = 'AddAgentPage';

export default AddAgentPage;
