import React, {useEffect, useRef, useState} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentPromptUpdateError, readAgentPrompt, updateAgentPrompt} from '@libs/actions/Agent';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';

const MAX_VISIBLE_PROMPT_LINES = 15;

type AgentAIPromptSectionProps = {
    accountID: number;
};

function AgentAIPromptSection({accountID}: AgentAIPromptSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [isEditing, setIsEditing] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState('');
    const [showEmptyError, setShowEmptyError] = useState(false);
    const inputRef = useRef<BaseTextInputRef>(null);

    useEffect(() => {
        readAgentPrompt(accountID);
    }, [accountID]);

    useEffect(() => {
        if (!isEditing || !agentPrompt?.promptErrors) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftPrompt(agentPrompt?.prompt ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentPrompt?.promptErrors]);

    const handleEditPress = () => {
        setDraftPrompt(agentPrompt?.prompt ?? '');
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
                        errorText={showEmptyError ? translate('profilePage.aiPromptSection.promptCannotBeEmpty') : ''}
                        containerStyles={[styles.mb4]}
                        testID="ai-prompt-input"
                        autoFocus
                    />
                ) : (
                    <View
                        style={[styles.border, styles.borderRadiusComponentLarge, styles.p4, styles.mb4]}
                        testID="ai-prompt-box"
                    >
                        <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('profilePage.aiPromptSection.prompt')}</Text>
                        <Text
                            numberOfLines={10}
                            testID="ai-prompt-text"
                        >
                            {agentPrompt?.prompt ?? ''}
                        </Text>
                    </View>
                )}
            </OfflineWithFeedback>
            {isEditing ? (
                <View style={[styles.flexRow, styles.gap3]}>
                    <Button
                        success
                        text={translate('common.save')}
                        onPress={handleSave}
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
