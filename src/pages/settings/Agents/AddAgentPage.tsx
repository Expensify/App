import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import type {AgentAvatarID} from '@libs/Avatars/AgentAvatarCatalog';
import {isMobile} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {clearNewAgentTemplate, createAgent} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type NewAgentTemplate from '@src/types/onyx/NewAgentTemplate';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';

import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken, setReturnRoute} from './pendingAgentAvatarStore';

type AddAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

type AddAgentPageContentProps = {
    /** Route params (policyID) forwarded from the screen */
    route: AddAgentPageProps['route'];

    /** Template picked in the "New agent" screen used to pre-fill the fields, or undefined for a blank agent */
    template: NewAgentTemplate | undefined;
};

function pickRandomPresetID(): AgentAvatarID | null {
    return AGENT_AVATARS.ordered.at(Math.floor(Math.random() * AGENT_AVATARS.ordered.length))?.id ?? null;
}

function AddAgentPageContent({route, template}: AddAgentPageContentProps) {
    const policyID = route.params?.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollableLayout = useIsInLandscapeMode() || (isMobile() && windowWidth > windowHeight);
    const {displayName} = useCurrentUserPersonalDetails();
    const defaultAgentName = template?.name ?? (displayName ? translate('addAgentPage.defaultAgentName', displayName) : undefined);
    const defaultPrompt = template?.prompt ?? translate('addAgentPage.defaultPrompt');
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfCenter];
    const [selectedPresetID, setSelectedPresetID] = useState<AgentAvatarID | null>(() =>
        template && AGENT_AVATARS.isAvatarID(template.avatarID) ? template.avatarID : pickRandomPresetID(),
    );
    const [uploadedURI, setUploadedURI] = useState<string | null>(null);
    const pendingFileRef = useRef<{file: File | CustomRNImageManipulatorResult; uri: string} | null>(null);

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

        // Done with the stashed template — drop it so a later blank flow doesn't reopen pre-filled.
        clearNewAgentTemplate();

        // Created the agent — close the whole creation flow (this page + the template picker) and reveal the agents list.
        Navigation.dismissModal();
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
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_AGENTS_NEW.getRoute(policyID ? {policyID} : undefined))}
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
                    <Text style={[styles.textLabelSupporting]}>{translate('addAgentPage.copilotNote')}</Text>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

function AddAgentPage({route}: AddAgentPageProps) {
    const [template, templateMetadata] = useOnyx(ONYXKEYS.NEW_AGENT_TEMPLATE);

    // Wait for the stashed template to resolve before mounting the form: the inputs' `defaultValue` and the
    // avatar's initial state are captured once at mount, so they must see a template that persisted across a refresh.
    // Same-session navigation hits the Onyx cache and skips this, so there's no flash in the common path.
    if (isLoadingOnyxValue(templateMetadata)) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'AddAgentPage'}} />;
    }

    return (
        <AddAgentPageContent
            route={route}
            template={template}
        />
    );
}

AddAgentPage.displayName = 'AddAgentPage';

export default AddAgentPage;
