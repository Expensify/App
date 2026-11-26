import Button from '@components/Button';
import ErrorMessageRow from '@components/ErrorMessageRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useFetchAfterAppLoaded from '@hooks/useFetchAfterAppLoaded';
import useKeyboardDrivenScroll from '@hooks/useKeyboardDrivenScroll';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearAgentPromptUpdateError, openProfilePage, updateAgentPrompt} from '@libs/actions/Agent';
import {containsHtmlTag} from '@libs/ValidationUtils';

import scrollToMultilineInput from '@pages/settings/Agents/scrollToMultilineInput';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, TextInputKeyPressEvent} from 'react-native';
import type {AnimatedRef} from 'react-native-reanimated';

import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

const MAX_VISIBLE_PROMPT_LINES = 15;
const SAVED_CONFIRMATION_DURATION_MS = 2000;

type AgentAIPromptSectionProps = {
    accountID: number;
    parentScrollViewRef: AnimatedRef<ComponentRef<typeof RNScrollView>>;
};

function AgentAIPromptSection({accountID, parentScrollViewRef}: AgentAIPromptSectionProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`);
    const [draftPrompt, setDraftPrompt] = useState('');
    const [showEmptyError, setShowEmptyError] = useState(false);
    const [showHtmlError, setShowHtmlError] = useState(false);
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
    const [isUserInitiatedSave, setIsUserInitiatedSave] = useState(false);
    const inputRef = useRef<BaseTextInputRef>(null);
    const scrollWithKeyboard = useKeyboardDrivenScroll(parentScrollViewRef);
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
    } else if (showHtmlError && hasHtmlTag) {
        errorText = translate('common.error.invalidCharacter');
    }
    const storedPrompt = Str.htmlDecode(agentPrompt?.prompt ?? '');

    useFetchAfterAppLoaded(openProfilePage, accountID);

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

    const triggerSavedConfirmation = () => {
        setShowSavedConfirmation(true);
        if (savedConfirmationTimerRef.current) {
            clearTimeout(savedConfirmationTimerRef.current);
        }
        savedConfirmationTimerRef.current = setTimeout(() => {
            setShowSavedConfirmation(false);
            savedConfirmationTimerRef.current = null;
        }, SAVED_CONFIRMATION_DURATION_MS);
    };

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

    // Network dropped mid-save: pendingAction stays 'update' until reconnect, so isSaving never flips
    // and the button loader would spin indefinitely. Match the offline-save UX from handleSave by
    // confirming the optimistic write; the queued request replays on reconnect.
    useEffect(() => {
        if (!isOffline || !isUserInitiatedSave) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        triggerSavedConfirmation();
        setIsUserInitiatedSave(false);
    }, [isOffline, isUserInitiatedSave, triggerSavedConfirmation]);

    useEffect(() => {
        return () => {
            if (!savedConfirmationTimerRef.current) {
                return;
            }
            clearTimeout(savedConfirmationTimerRef.current);
        };
    }, []);

    const dismissInput = () => {
        inputRef.current?.blur();
        Keyboard.dismiss();
    };

    // Like scrollToEnd, as the scroll view stops at its end
    const scrollInputIntoView = () => scrollToMultilineInput(scrollWithKeyboard, true, Number.MAX_SAFE_INTEGER);

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
            setShowHtmlError(true);
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
        if (showHtmlError && !containsHtmlTag(text)) {
            setShowHtmlError(false);
        }
    };

    const handleKeyPress = (e: TextInputKeyPressEvent) => {
        const event = e as unknown as KeyboardEvent;
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            // The markdown input inserts a line break for any Enter keydown whose default is not already prevented, so the submit combo has to claim it first.
            event.preventDefault();
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
                    type="markdown"
                    excludedMarkdownStyles={['mentionReport']}
                    value={draftPrompt}
                    onChangeText={handleChangeText}
                    onKeyPress={handleKeyPress}
                    maxLength={CONST.AGENT_PROMPT_MAX_LENGTH}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PROFILE.AI_PROMPT}
                    multiline
                    autoGrowHeight
                    maxAutoGrowHeight={variables.lineHeightNormal * MAX_VISIBLE_PROMPT_LINES}
                    errorText={errorText}
                    containerStyles={[styles.mb3]}
                    testID="ai-prompt-input"
                    onFocus={scrollInputIntoView}
                />
            </OfflineWithFeedback>
            <Text style={[styles.textMicroSupporting, styles.mt1, styles.mb5]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
            <Button
                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PROFILE.AI_PROMPT_SAVE}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={handleSave}
                isLoading={isSaving && isUserInitiatedSave}
                isDisabled={isSaving && isUserInitiatedSave}
                style={[styles.alignSelfStart]}
                testID="save-prompt-button"
            >
                {showSavedConfirmation && <Button.Icon src={icons.Checkmark} />}
                <Button.Text>{showSavedConfirmation ? translate('profilePage.aiPromptSection.saved') : translate('common.save')}</Button.Text>
            </Button>
            <ErrorMessageRow
                errors={agentPrompt?.promptErrors}
                errorRowStyles={[styles.mt3]}
                onDismiss={() => clearAgentPromptUpdateError(accountID)}
            />
        </Section>
    );
}

export default AgentAIPromptSection;
