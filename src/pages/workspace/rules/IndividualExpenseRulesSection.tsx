import React from 'react';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type IndividualExpenseRulesSectionProps = {
    policyID: string;
};

function IndividualExpenseRulesSection({policyID}: IndividualExpenseRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.individualExpenseRules.title')}
            subtitle={translate('workspace.rules.individualExpenseRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        />
    );
}

export default IndividualExpenseRulesSection;
