import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import type {AgentAvatarID} from '@libs/Avatars/AgentAvatarCatalog';
import {isMobile} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {createAgent} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';

import PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE from './const';
import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken, setReturnRoute} from './pendingAgentAvatarStore';
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
    const [selectedPresetID, setSelectedPresetID] = useState<AgentAvatarID | null>(() => AGENT_AVATARS.ordered.at(Math.floor(Math.random() * AGENT_AVATARS.ordered.length))?.id ?? null);
    const [uploadedURI, setUploadedURI] = useState<string | null>(null);
    const pendingFileRef = useRef<{
        file: File | CustomRNImageManipulatorResult;
        uri: string;
    } | null>(null);

    useFocusEffect(
        useCallback(() => {
            const pending = getPendingAvatar();
            if (!pending) {
                return;
            }
            clearPendingAvatar();

            if (pending.type === 'preset' && AGENT_AVATARS.isAvatarID(pending.id)) {
                setSelectedPresetID(pending.id);
                setUploadedURI(null);
                pendingFileRef.current = null;
            } else if (pending.type !== 'preset') {
                setSelectedPresetID(null);
                setUploadedURI(pending.uri);
                pendingFileRef.current = {file: pending.file, uri: pending.uri};
            }
        }, []),
    );

    const avatarSource: AvatarSource = selectedPresetID ? (AGENT_AVATARS.getLocal(selectedPresetID) ?? '') : (uploadedURI ?? '');

    const handleAvatarPress = () => {
        setInitialPresetID(selectedPresetID ?? undefined);
        setNavigationToken();
        setReturnRoute(ROUTES.SETTINGS_AGENTS_ADD.getRoute());
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
        if (pendingFile) {
            createAgent(firstName, prompt, undefined, pendingFile.file, pendingFile.uri, policyID);
        } else {
            createAgent(firstName, prompt, selectedPresetID ?? undefined, undefined, undefined, policyID);
        }

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
            <CollapsibleHeaderOnKeyboard alwaysCollapseHeaderOnKeyboard>
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
