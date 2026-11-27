/** Row naming the workspace setting behind a violation type, with a link to edit it. Shown only to the workspace's admins. */
import Button from '@components/Button';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';

import {getPoliciesInScope, getReportedPolicies} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import getInsightsViolationRule from './getInsightsViolationRule';

type InsightsViolationRuleProps = {
    /** Workspaces picked in the Workspace filter, empty for all of them */
    policyIDs: string[];

    /** Violation type of the clicked Top violations item */
    violation: string;
};

function InsightsViolationRule({policyIDs, violation}: InsightsViolationRuleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {login} = useCurrentUserPersonalDetails();
    const [rule] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => {
            // A setting belongs to one workspace, so it can only be named when the dashboard reports on exactly one
            const reportedPolicies = getReportedPolicies(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, getPoliciesInScope(policies, policyIDs), login);
            const policy = reportedPolicies.length === 1 ? reportedPolicies.at(0) : undefined;
            return isPolicyAdmin(policy) ? getInsightsViolationRule(violation, policy) : undefined;
        },
    });

    if (!rule) {
        return null;
    }

    const getSettingText = () => {
        switch (rule.type) {
            case CONST.VIOLATIONS.MAX_AGE:
                return translate('violations.maxAge', rule.days);
            case CONST.VIOLATIONS.MISSING_CATEGORY:
                return translate('violations.missingCategory');
            default:
                return translate(`violations.${rule.type}`, convertToDisplayString(rule.amount, rule.currency));
        }
    };

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.p4]}>
            <View style={[styles.flex1, styles.gap1]}>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {translate('insightsPage.violationRule.rule')}
                </Text>
                <Text>{getSettingText()}</Text>
            </View>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={() => Navigation.navigate(rule.route)}
                accessibilityLabel={translate('insightsPage.violationRule.editRule')}
                sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_EDIT_RULE}
            >
                <Button.Text>{translate('insightsPage.violationRule.editRule')}</Button.Text>
            </Button>
        </View>
    );
}

export default InsightsViolationRule;
