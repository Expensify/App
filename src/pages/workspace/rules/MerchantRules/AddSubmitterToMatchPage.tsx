import useExpenseDefaultSubmitterNames from '@hooks/useExpenseDefaultSubmitterNames';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import {updateDraftMerchantRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {RuleConditionItem} from './RuleConditionMultiSelectPage';

import RuleConditionMultiSelectPage from './RuleConditionMultiSelectPage';
import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddSubmitterToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_SUBMITTER_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_SUBMITTER_TO_MATCH
>;

function AddSubmitterToMatchPage({route}: AddSubmitterToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_SUBMITTER_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const {translate, formatPhoneNumber} = useLocalize();
    const policy = usePolicy(policyID);
    const members = useWorkspaceMembers(policy);
    const submitters = useExpenseDefaultSubmitterNames(policy);

    // Stored as account IDs, which is what the `from` filter carries. A member whose personal details have not
    // loaded is listed under a generated ID, and one invited offline holds a temporary ID until the invite
    // syncs. Neither is an ID an expense carries, so picking them would save a rule that can never match.
    const submitterItems: RuleConditionItem[] = members
        .filter(({hasKnownAccountID, details}) => hasKnownAccountID && !details.isOptimisticPersonalDetail)
        .map(({accountID, details}) => ({
            value: String(accountID),
            text: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
            alternateText: formatPhoneNumber(details.login ?? ''),
        }));

    return (
        <RuleConditionMultiSelectPage
            field="submittersToMatch"
            title={translate('common.submitter')}
            testID="AddSubmitterToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SUBMITTER_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={submitterItems}
            onSave={(submittersToMatch) => updateDraftMerchantRule({submittersToMatch})}
            getFallbackText={(accountID) => submitters[accountID] ?? accountID}
        />
    );
}

export default AddSubmitterToMatchPage;
