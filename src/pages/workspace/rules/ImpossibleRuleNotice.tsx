/**
 * Tells the admin why Concierge refused a rule, and quotes the closest rule that RuleBot can carry out.
 */
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {GeneratedRule} from '@src/types/onyx';
import type {GeneratedRuleImpossibleReason} from '@src/types/onyx/GeneratedRule';

import React from 'react';
import {View} from 'react-native';

type ImpossibleRuleNoticeProps = {
    /** The `impossible` answer of Concierge */
    refusal: GeneratedRule;
};

// A reason that this app version does not know gets the general text
const IMPOSSIBLE_TITLE_BY_REASON: Partial<Record<string, TranslationPaths>> = {
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_TRIGGER]: 'workspace.rules.newRule.impossible.noTrigger',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY]: 'workspace.rules.newRule.impossible.noCapability',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.MISSING_DATA]: 'workspace.rules.newRule.impossible.missingData',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.RETROACTIVE]: 'workspace.rules.newRule.impossible.retroactive',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.HISTORY_LIMIT]: 'workspace.rules.newRule.impossible.historyLimit',
} satisfies Record<GeneratedRuleImpossibleReason, TranslationPaths>;

function ImpossibleRuleNotice({refusal}: ImpossibleRuleNoticeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const suggestedPrompt = refusal.suggestedPrompt;

    // An answer without an explanation still says why, with the general text for its reason
    const explanation = refusal.explanation ? refusal.explanation : translate(IMPOSSIBLE_TITLE_BY_REASON[refusal.reason ?? ''] ?? 'workspace.rules.newRule.impossible.noCapability');

    return (
        <View style={styles.mt4}>
            <Text style={styles.textSupporting}>{suggestedPrompt ? translate('workspace.rules.newRule.impossible.explanationWithSuggestion', explanation) : explanation}</Text>
            {!!suggestedPrompt && <Text style={styles.mt3}>{translate('workspace.rules.newRule.impossible.quotedSuggestion', suggestedPrompt)}</Text>}
        </View>
    );
}

ImpossibleRuleNotice.displayName = 'ImpossibleRuleNotice';

export default ImpossibleRuleNotice;
