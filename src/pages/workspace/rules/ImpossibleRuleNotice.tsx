/**
 * Tells the admin why Concierge refused a rule, and offers the closest rule that RuleBot can carry out.
 */
import Button from '@components/Button';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
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

    /** Called with the suggested rule when the admin taps Try this instead */
    onTrySuggestion: (suggestedPrompt: string) => void;
};

// A reason that this app version does not know gets the general title
const IMPOSSIBLE_TITLE_BY_REASON: Partial<Record<string, TranslationPaths>> = {
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_TRIGGER]: 'workspace.rules.newRule.impossible.noTrigger',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY]: 'workspace.rules.newRule.impossible.noCapability',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.MISSING_DATA]: 'workspace.rules.newRule.impossible.missingData',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.RETROACTIVE]: 'workspace.rules.newRule.impossible.retroactive',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.HISTORY_LIMIT]: 'workspace.rules.newRule.impossible.historyLimit',
} satisfies Record<GeneratedRuleImpossibleReason, TranslationPaths>;

function ImpossibleRuleNotice({refusal, onTrySuggestion}: ImpossibleRuleNoticeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const suggestedPrompt = refusal.suggestedPrompt;

    return (
        <View style={styles.mt4}>
            <Text style={styles.textStrong}>{translate(IMPOSSIBLE_TITLE_BY_REASON[refusal.reason ?? ''] ?? 'workspace.rules.newRule.impossible.noCapability')}</Text>
            {!!refusal.explanation && <Text style={[styles.textSupporting, styles.mt1]}>{refusal.explanation}</Text>}
            {!!suggestedPrompt && (
                <>
                    <Text style={styles.mt3}>{suggestedPrompt}</Text>
                    <Button
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => onTrySuggestion(suggestedPrompt)}
                        // Like the form's submit button, this button sends GenerateRule, which needs a connection
                        isDisabled={isOffline}
                        style={[styles.mt2, styles.alignSelfStart]}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.DESCRIBE_RULE_TRY_SUGGESTION}
                    >
                        <Button.Text>{translate('workspace.rules.newRule.impossible.tryThisInstead')}</Button.Text>
                    </Button>
                </>
            )}
        </View>
    );
}

ImpossibleRuleNotice.displayName = 'ImpossibleRuleNotice';

export default ImpossibleRuleNotice;
