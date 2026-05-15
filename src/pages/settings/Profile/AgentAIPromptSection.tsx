import React, {useEffect, useState} from 'react';
import {TextInput, View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentPromptUpdateError, openAgentsPage, updateAgentPromptAsCopilot} from '@libs/actions/Agent';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentAIPromptSectionProps = {
    accountID: number;
};

function AgentAIPromptSection({accountID}: AgentAIPromptSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [isEditing, setIsEditing] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState('');

    useEffect(() => {
        openAgentsPage();
    }, []);

    const handleEditPress = () => {
        setDraftPrompt(agentPrompt?.prompt ?? '');
        setIsEditing(true);
    };

    const handleSave = () => {
        const trimmed = draftPrompt.trim();
        if (!trimmed) {
            return;
        }
        updateAgentPromptAsCopilot(accountID, trimmed, agentPrompt?.prompt ?? '');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDraftPrompt('');
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
                onClose={() => clearAgentPromptUpdateError(accountID)}
            >
                <View
                    style={[styles.border, styles.borderRadiusComponentLarge, styles.p4, styles.mb4]}
                    testID="ai-prompt-box"
                >
                    <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('profilePage.aiPromptSection.prompt')}</Text>
                    {isEditing ? (
                        <TextInput
                            value={draftPrompt}
                            onChangeText={setDraftPrompt}
                            multiline
                            style={[styles.textNormal, styles.textAlignVerticalTop, styles.flexibleHeight]}
                            testID="ai-prompt-input"
                            accessibilityLabel={translate('profilePage.aiPromptSection.prompt')}
                            autoFocus
                        />
                    ) : (
                        <Text testID="ai-prompt-text">{agentPrompt?.prompt ?? ''}</Text>
                    )}
                </View>
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
