import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useChatWithAgent from '@hooks/useChatWithAgent';
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
import {getIsOffline} from '@libs/NetworkState';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {createAgent} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import {clearPendingAvatar, getPendingAvatar, setInitialPresetID, setNavigationToken, setReturnRoute} from './pendingAgentAvatarStore';

type AddAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

type PendingCreatedAgent = {
    optimisticAccountID: number;
    // Captured lazily from the first fully-loaded collection snapshot that includes our optimistic entry,
    // so agents that hydrate late aren't mistaken for the one we just created. Null until then.
    knownAgentAccountIDs: Set<number> | null;
};

function getAgentAccountIDFromKey(key: string): number {
    return Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
}

function AddAgentPage({route}: AddAgentPageProps) {
    const policyID = route.params?.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollableLayout = useIsInLandscapeMode() || (isMobile() && windowWidth > windowHeight);
    const {displayName} = useCurrentUserPersonalDetails();
    const chatWithAgent = useChatWithAgent();
    const [agentPrompts, agentPromptsMetadata] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const defaultAgentName = displayName ? translate('addAgentPage.defaultAgentName', displayName) : undefined;
    const defaultPrompt = translate('addAgentPage.defaultPrompt');
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfCenter];
    const [selectedPresetID, setSelectedPresetID] = useState<AgentAvatarID | null>(() => AGENT_AVATARS.ordered.at(Math.floor(Math.random() * AGENT_AVATARS.ordered.length))?.id ?? null);
    const [uploadedURI, setUploadedURI] = useState<string | null>(null);
    const [isCreatingAgent, setIsCreatingAgent] = useState(false);
    const pendingFileRef = useRef<{file: File | CustomRNImageManipulatorResult; uri: string} | null>(null);

    // Account IDs can't be generated optimistically (unlike report IDs), so an agent's real accountID only
    // exists once CREATE_AGENT responds. When creating online we keep this page mounted until that happens,
    // then open the DM.
    const pendingCreatedAgentRef = useRef<PendingCreatedAgent | null>(null);

    useEffect(() => {
        const pendingCreatedAgent = pendingCreatedAgentRef.current;
        if (!pendingCreatedAgent) {
            return;
        }

        // Never match against a partially-hydrated collection — an existing agent that hydrates late could be
        // mistaken for the one we just created and open its DM instead.
        if (agentPromptsMetadata.status !== 'loaded') {
            return;
        }

        const optimisticAgentKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${pendingCreatedAgent.optimisticAccountID}`;

        // Establish the baseline from the first fully-loaded snapshot that already includes our optimistic entry.
        // Every agent present alongside our placeholder at that point genuinely pre-existed, so capturing here
        // (rather than at submit time, when the collection may not have hydrated) avoids false matches.
        if (!pendingCreatedAgent.knownAgentAccountIDs) {
            if (!agentPrompts?.[optimisticAgentKey]) {
                return;
            }
            pendingCreatedAgent.knownAgentAccountIDs = new Set(Object.keys(agentPrompts).map(getAgentAccountIDFromKey));
            return;
        }
        const {knownAgentAccountIDs} = pendingCreatedAgent;

        // Creation failed: the optimistic entry now carries an error. Dismiss and let the Agents list surface it.
        if (agentPrompts?.[optimisticAgentKey]?.errors) {
            pendingCreatedAgentRef.current = null;
            Navigation.goBack();
            return;
        }

        const createdAgentKey = Object.keys(agentPrompts ?? {}).find((key) => {
            const accountID = getAgentAccountIDFromKey(key);

            // Ignore agents that already existed at baseline and this request's own optimistic placeholder.
            if (accountID === pendingCreatedAgent.optimisticAccountID || knownAgentAccountIDs.has(accountID)) {
                return false;
            }

            // A real, server-created agent has no ADD pending action — that's the one we can open a DM with.
            // Another agent the user created in the meantime is still an optimistic ADD placeholder.
            return agentPrompts?.[key]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
        });
        if (!createdAgentKey) {
            return;
        }

        pendingCreatedAgentRef.current = null;
        chatWithAgent(getAgentAccountIDFromKey(createdAgentKey), {shouldDismissModal: true});
    }, [agentPrompts, agentPromptsMetadata.status, chatWithAgent]);

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

        // `createAgent` writes the agent optimistically (works offline) and returns the optimistic
        // accountID it wrote into Onyx. The real, server-assigned accountID only arrives once CREATE_AGENT responds.
        const {optimisticAccountID} = pendingFile
            ? createAgent(firstName, prompt, undefined, pendingFile.file, pendingFile.uri, policyID)
            : createAgent(firstName, prompt, selectedPresetID ?? undefined, undefined, undefined, policyID);

        // Offline: the real accountID only arrives after reconnect, long after the user has moved on, so we
        // don't wait — just return to the list with the optimistic agent for the user to open when they choose.
        if (getIsOffline()) {
            Navigation.goBack();
            return;
        }

        // Online: opening the DM is the immediate continuation of tapping "Create", but it needs the real
        // accountID. Stay on this page (showing the submit spinner) until the created agent appears in the
        // collection, then the effect opens the DM. The baseline of existing agents is captured later, once the
        // collection has loaded, so a partial snapshot here can't cause us to match an already-existing agent.
        pendingCreatedAgentRef.current = {
            optimisticAccountID,
            knownAgentAccountIDs: null,
        };
        setIsCreatingAgent(true);
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
                isLoading={isCreatingAgent}
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

AddAgentPage.displayName = 'AddAgentPage';

export default AddAgentPage;
