import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, TextInputKeyPressEvent} from 'react-native';
import {Keyboard} from 'react-native';
import Button from '@components/Button';
import ErrorMessageRow from '@components/ErrorMessageRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentPromptUpdateError, openProfilePage, updateAgentPrompt} from '@libs/actions/Agent';
import getPlatform from '@libs/getPlatform';
import {containsHtmlTag} from '@libs/ValidationUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const MAX_VISIBLE_PROMPT_LINES = 15;
const SAVED_CONFIRMATION_DURATION_MS = 2000;

type AgentAIPromptSectionProps = {
    accountID: number;
    parentScrollViewRef?: RefObject<RNScrollView | null>;
};

function scrollInputIntoView(parentScrollViewRef: RefObject<RNScrollView | null>) {
    if (getPlatform() !== CONST.PLATFORM.IOS) {
        return;
    }

    const scrollView = parentScrollViewRef.current;
    if (!scrollView) {
        return;
    }

    requestAnimationFrame(() => {
        setTimeout(() => {
            scrollView.scrollToEnd({animated: true});
        }, CONST.ANIMATED_TRANSITION);
    });
}

function AgentAIPromptSection({accountID, parentScrollViewRef}: AgentAIPromptSectionProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [draftPrompt, setDraftPrompt] = useState('');
    const [showEmptyError, setShowEmptyError] = useState(false);
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
    const [isUserInitiatedSave, setIsUserInitiatedSave] = useState(false);
    const inputRef = useRef<BaseTextInputRef>(null);
    const wasSavingRef = useRef(false);
    const savedConfirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSaving = agentPrompt?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    const hasPromptErrors = !!agentPrompt?.promptErrors;

    // Mirrors FormProvider's HTML-tag validation so inputs like `<script>...</script>` are blocked
    // here the same way they are in EditPromptPage (which uses FormProvider).
    const hasHtmlTag = containsHtmlTag(draftPrompt);
    let errorText = '';
    if (showEmptyError) {
        errorText = translate('profilePage.aiPromptSection.promptCannotBeEmpty');
    } else if (hasHtmlTag) {
        errorText = translate('common.error.invalidCharacter');
    }
    const storedPrompt = Str.htmlDecode(agentPrompt?.prompt ?? '');

    // Delegate.connect seeds IS_LOADING_APP=true via clearOnyxForDelegateTransition and OpenApp's optimisticData,
    // then flips it back to false in OpenApp's finallyData. By that point NetworkStore.authToken is the delegate.
    // Waiting on this transition prevents firing OpenProfilePage with the owner authToken during a copilot switch.
    useEffect(() => {
        if (isLoadingApp) {
            return;
        }
        openProfilePage();
    }, [isLoadingApp, accountID]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftPrompt(storedPrompt);
    }, [accountID, storedPrompt]);

    useEffect(() => {
        if (!agentPrompt?.promptErrors) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftPrompt(storedPrompt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentPrompt?.promptErrors]);

    const triggerSavedConfirmation = useCallback(() => {
        setShowSavedConfirmation(true);
        if (savedConfirmationTimerRef.current) {
            clearTimeout(savedConfirmationTimerRef.current);
        }
        savedConfirmationTimerRef.current = setTimeout(() => {
            setShowSavedConfirmation(false);
            savedConfirmationTimerRef.current = null;
        }, SAVED_CONFIRMATION_DURATION_MS);
    }, []);

    useEffect(() => {
        if (wasSavingRef.current && !isSaving) {
            if (isUserInitiatedSave && !hasPromptErrors) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                triggerSavedConfirmation();
            }
            setIsUserInitiatedSave(false);
        }
        wasSavingRef.current = isSaving;
    }, [isSaving, hasPromptErrors, isUserInitiatedSave, triggerSavedConfirmation]);

    useEffect(() => {
        return () => {
            if (!savedConfirmationTimerRef.current) {
                return;
            }
            clearTimeout(savedConfirmationTimerRef.current);
        };
    }, []);

    const dismissInput = useCallback(() => {
        inputRef.current?.blur();
        Keyboard.dismiss();
    }, []);

    const handleInputFocus = useCallback(() => {
        if (!parentScrollViewRef) {
            return;
        }
        scrollInputIntoView(parentScrollViewRef);
    }, [parentScrollViewRef]);

    const handleSave = () => {
        if (isSaving && isUserInitiatedSave) {
            return;
        }

        const trimmed = draftPrompt.trim();
        if (!trimmed) {
            setShowEmptyError(true);
            inputRef.current?.focus();
            return;
        }
        if (containsHtmlTag(trimmed)) {
            inputRef.current?.focus();
            return;
        }
        dismissInput();
        updateAgentPrompt(accountID, trimmed, agentPrompt?.prompt ?? '');

        // Offline: treat the optimistic write as the final state for UX purposes. The request will be
        // replayed on reconnect without save-button feedback since the user already saw "Saved".
        if (isOffline) {
            triggerSavedConfirmation();
        } else {
            setIsUserInitiatedSave(true);
        }
    };

    const handleChangeText = (text: string) => {
        setDraftPrompt(text);
        if (showEmptyError && text.trim()) {
            setShowEmptyError(false);
        }
    };

    const handleKeyPress = (e: TextInputKeyPressEvent) => {
        const event = e as unknown as KeyboardEvent;
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            handleSave();
        }
    };

    return (
        <Section
            title={translate('profilePage.aiPromptSection.title')}
            subtitle={translate('profilePage.aiPromptSection.subtitle')}
            isCentralPane
            subtitleMuted
            childrenStyles={styles.pt5}
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <OfflineWithFeedback pendingAction={agentPrompt?.pendingAction}>
                <TextInput
                    ref={inputRef}
                    label={translate('profilePage.aiPromptSection.prompt')}
                    accessibilityLabel={translate('profilePage.aiPromptSection.prompt')}
                    value={draftPrompt}
                    onChangeText={handleChangeText}
                    onKeyPress={handleKeyPress}
                    multiline
                    autoGrowHeight
                    maxAutoGrowHeight={variables.lineHeightNormal * MAX_VISIBLE_PROMPT_LINES}
                    errorText={errorText}
                    containerStyles={[styles.mb3]}
                    testID="ai-prompt-input"
                    onFocus={handleInputFocus}
                />
            </OfflineWithFeedback>
            <Button
                success
                text={showSavedConfirmation ? translate('profilePage.aiPromptSection.saved') : translate('common.save')}
                icon={showSavedConfirmation ? icons.Checkmark : undefined}
                onPress={handleSave}
                isLoading={isSaving && isUserInitiatedSave}
                isDisabled={hasHtmlTag || (isSaving && isUserInitiatedSave)}
                style={[styles.alignSelfStart]}
                testID="save-prompt-button"
            />
            <ErrorMessageRow
                errors={agentPrompt?.promptErrors}
                errorRowStyles={[styles.mt3]}
                onDismiss={() => clearAgentPromptUpdateError(accountID)}
            />
        </Section>
    );
}

export default AgentAIPromptSection;
