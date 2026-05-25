import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentPromptUpdateError, openProfilePage, updateAgentPrompt} from '@libs/actions/Agent';
import getPlatform from '@libs/getPlatform';
import Parser from '@libs/Parser';
import {containsHtmlTag} from '@libs/ValidationUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const MAX_VISIBLE_PROMPT_LINES = 15;

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
    const styles = useThemeStyles();
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isEditing, setIsEditing] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState('');
    const [showEmptyError, setShowEmptyError] = useState(false);
    const inputRef = useRef<BaseTextInputRef>(null);

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
        if (!isEditing || !agentPrompt?.promptErrors) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftPrompt(storedPrompt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentPrompt?.promptErrors]);

    useEffect(() => {
        if (!isEditing || !parentScrollViewRef) {
            return;
        }
        scrollInputIntoView(parentScrollViewRef);
    }, [isEditing, parentScrollViewRef]);

    const handleInputFocus = useCallback(() => {
        if (!parentScrollViewRef) {
            return;
        }
        scrollInputIntoView(parentScrollViewRef);
    }, [parentScrollViewRef]);

    const handleEditPress = () => {
        setDraftPrompt(storedPrompt);
        setShowEmptyError(false);
        setIsEditing(true);
    };

    const handleSave = () => {
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
        updateAgentPrompt(accountID, trimmed, agentPrompt?.prompt ?? '');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDraftPrompt('');
        setShowEmptyError(false);
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
            childrenStyles={styles.pt3}
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <OfflineWithFeedback
                errors={agentPrompt?.promptErrors}
                pendingAction={agentPrompt?.pendingAction}
                onClose={() => clearAgentPromptUpdateError(accountID)}
            >
                {isEditing ? (
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
                        containerStyles={[styles.mb4]}
                        testID="ai-prompt-input"
                        autoFocus
                        onFocus={handleInputFocus}
                    />
                ) : (
                    <View
                        style={[styles.border, styles.borderRadiusComponentLarge, styles.p4, styles.mb4]}
                        testID="ai-prompt-box"
                    >
                        <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('profilePage.aiPromptSection.prompt')}</Text>
                        <ScrollView
                            style={{maxHeight: variables.lineHeightNormal * MAX_VISIBLE_PROMPT_LINES}}
                            testID="ai-prompt-text"
                        >
                            <RenderHTML html={Parser.replace(storedPrompt)} />
                        </ScrollView>
                    </View>
                )}
            </OfflineWithFeedback>
            {isEditing ? (
                <View style={[styles.flexRow, styles.gap3]}>
                    <Button
                        success
                        text={translate('common.save')}
                        onPress={handleSave}
                        isDisabled={hasHtmlTag}
                        style={[styles.alignSelfStart]}
                        testID="save-prompt-button"
                    />
                    <Button
                        text={translate('common.cancel')}
                        onPress={handleCancel}
                        style={[styles.alignSelfStart]}
                        testID="cancel-prompt-button"
                    />
                </View>
            ) : (
                <Button
                    text={translate('profilePage.aiPromptSection.editPrompt')}
                    onPress={handleEditPress}
                    style={[styles.alignSelfStart]}
                    testID="edit-prompt-button"
                />
            )}
        </Section>
    );
}

export default AgentAIPromptSection;
