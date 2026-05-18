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
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobile} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {createAgent} from '@userActions/Agent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken} from './pendingAgentAvatarStore';

function AddAgentPage() {
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
        const firstName = values[INPUT_IDS.FIRST_NAME].trim() || undefined;
        const prompt = values[INPUT_IDS.PROMPT].trim();
        const pendingFile = pendingFileRef.current;

        if (pendingFile) {
            createAgent(firstName, prompt, undefined, pendingFile.file, pendingFile.uri);
        } else {
            createAgent(firstName, prompt, botAvatarIDs.get(avatarSource as BotAvatar));
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
                            editIconStyle={styles.profilePageAvatar}
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
