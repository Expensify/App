import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

const EXPENSE_REPORT_RULE_TYPES = [
    {title: 'workspace.rules.expenseReportRules.customReportNamesTitle', description: 'workspace.rules.expenseReportRules.customReportNamesDescription'},
    {title: 'workspace.rules.expenseReportRules.preventSelfApprovalsTitle', description: 'workspace.rules.expenseReportRules.preventSelfApprovalsDescription'},
    {title: 'workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle', description: 'workspace.rules.expenseReportRules.autoApproveCompliantReportsDescription'},
    {title: 'workspace.rules.expenseReportRules.autoPayApprovedReportsTitle', description: 'workspace.rules.expenseReportRules.autoPayApprovedReportsDescription'},
] as const;

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.expenseReportRules.title')}
            subtitle={translate('workspace.rules.expenseReportRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            {EXPENSE_REPORT_RULE_TYPES.map(({title, description}, index) => {
                const showBorderBottom = index !== EXPENSE_REPORT_RULE_TYPES.length - 1;

                return (
                    <ToggleSettingOptionRow
                        title={translate(title)}
                        subtitle={translate(description)}
                        wrapperStyle={[styles.pv6, showBorderBottom && styles.borderBottom]}
                        shouldPlaceSubtitleBelowSwitch
                        titleStyle={styles.pv2}
                        subtitleStyle={styles.pt1}
                        switchAccessibilityLabel={translate(title)}
                        isActive={false}
                        onToggle={() => {}}
                    />

                    // <MenuItem
                    //     description={translate(description)}
                    //     onPress={() => {}}
                    //     style={[{paddingHorizontal: 0}, showBorderBottom && styles.borderBottom]}
                    //     titleContainerStyle={styles.pv6}
                    //     descriptionTextStyle={styles.pt1}
                    //     isLabelHoverable={false}
                    //     shouldShowRightComponent
                    //     interactive={false}
                    //     titleComponent={
                    //         <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    //             <View style={styles.pv3}>
                    //                 <Text
                    //                     style={styles.popoverMenuText}
                    //                     numberOfLines={1}
                    //                 >
                    //                     {translate(title)}
                    //                 </Text>
                    //             </View>
                    //             <ToggleSettingOptionRow
                    //                 switchAccessibilityLabel={translate(title)}
                    //                 onToggle={() => {}}
                    //                 isActive={false}
                    //             />
                    //         </View>
                    //     }
                    //     shouldShowDescriptionOnTop={false}
                    // />
                );
            })}
        </Section>
    );
}

export default ExpenseReportRulesSection;
