import React from 'react';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Switch from '@components/Switch';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as WorkspaceRulesActions from '@userActions/Workspace/Rules';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const optionItems = [
        {
            title: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.customReportNamesSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            isActive: true,
            onToggle: (isEnabled: boolean) => {},
            subMenuItems: [
                <MenuItem
                    title={translate('workspace.rules.expenseReportRules.customNameTitle')}
                    titleStyle={styles.textLabelSupportingEmptyValue}
                    shouldShowRightIcon
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM_NAME.getRoute(policyID))}
                />,
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    switchAccessibilityLabel={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, {marginTop: 24}]}
                    titleStyle={{paddingVertical: 10}}
                    // titleStyle={styles.pv2}
                    // subtitleStyle={styles.pt1}
                    isActive={false}
                    onToggle={(isOn) => WorkspaceRulesActions.setPolicyPreventMemberCreatedTitle(!isOn, policyID)}
                    //             disabled={!!policy?.fieldList?.deletable}
                    //             isOn={false}
                />,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            onToggle: (isEnabled: boolean) => WorkspaceRulesActions.setPolicyPreventSelfApproval(isEnabled, policyID),
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            onToggle: (isEnabled: boolean) => {},
        },

        {
            title: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: (isEnabled: boolean) => {},
        },
    ];

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.expenseReportRules.title')}
            subtitle={translate('workspace.rules.expenseReportRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            {optionItems.map(({title, subtitle, isActive, subMenuItems}, index) => {
                const showBorderBottom = index !== optionItems.length - 1;

                return (
                    <ToggleSettingOptionRow
                        title={title}
                        subtitle={subtitle}
                        switchAccessibilityLabel={title}
                        wrapperStyle={[styles.pv6, showBorderBottom && styles.borderBottom]}
                        shouldPlaceSubtitleBelowSwitch
                        titleStyle={styles.pv2}
                        subtitleStyle={styles.pt1}
                        isActive={!!isActive}
                        subMenuItems={subMenuItems}
                        onToggle={() => {}}
                    />
                );
            })}
        </Section>
    );
}

export default ExpenseReportRulesSection;
