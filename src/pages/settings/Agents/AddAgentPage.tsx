import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {buildFileFromAvatarCropResult} from '@libs/AvatarCropUtils';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import {isMobile} from '@libs/Browser';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
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

import {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE, COLLAPSIBLE_HEADER_OFFSET} from './const';
import scrollToMultilineInput from './scrollToMultilineInput';

type AddAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function AddAgentPage({route}: AddAgentPageProps) {
    const StyleUtils = useStyleUtils();
    const policyID = route.params?.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);
    const shouldUseScrollableLayout = isInLandscapeMode || (isMobile() && windowWidth > windowHeight);
    const shouldShrinkPromptInput = shouldUseScrollableLayout && isKeyboardActive;
    const {displayName} = useCurrentUserPersonalDetails();
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

        // Pure optimistic flow — no waiting on the server; `createAgent` writes the optimistic agent into Onyx immediately.
        if (uploadedAvatar?.uri) {
            createAgent(firstName, prompt, undefined, buildFileFromAvatarCropResult(uploadedAvatar), uploadedAvatar.uri, policyID);
        } else {
            createAgent(firstName, prompt, selectedPresetID ?? AGENT_AVATARS.getRandomID(), undefined, undefined, policyID);
        }
        clearNewAgentAvatarDraft();
        Navigation.goBack();
    };

    const formWrapperRef = useRef<FormRef>(null);
    const handleInputFocus = () => scrollToMultilineInput(formWrapperRef, shouldUseScrollableLayout);

    return (
        <ScreenWrapper
            testID={AddAgentPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight={shouldUseScrollableLayout}
        >
            <CollapsibleHeaderOnKeyboard collapsibleHeaderOffset={COLLAPSIBLE_HEADER_OFFSET}>
                <HeaderWithBackButton
                    title={translate('addAgentPage.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
            </CollapsibleHeaderOnKeyboard>
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
                ref={formWrapperRef}
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
                    <View style={shouldShrinkPromptInput ? StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE) : [shouldUseScrollableLayout ? styles.h42 : styles.flex1]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('addAgentPage.instructions')}
                            accessibilityLabel={translate('addAgentPage.instructions')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={defaultPrompt}
                            multiline
                            containerStyles={[styles.h100]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                            onFocus={handleInputFocus}
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
