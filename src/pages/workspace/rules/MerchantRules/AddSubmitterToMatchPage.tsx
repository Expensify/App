import useExpenseDefaultSubmitterNames from '@hooks/useExpenseDefaultSubmitterNames';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePolicy from '@hooks/usePolicy';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {getSubmitterConditionName} from '@libs/MerchantTypeRulesUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {canRoleCreateExpenses} from '@libs/PolicyUtils';

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
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [allPersonalDetails] = useAllPersonalDetails();

    // A rule keeps naming a member the workspace has dropped, and a rule copied to another workspace names members
    // that workspace never had, so such a row is built from the details rather than left as a bare name.
    const getSubmitterFallbackItem = (accountID: string) => {
        const details = allPersonalDetails?.[accountID];
        const name = getSubmitterConditionName(accountID, submitters, translate);
        return {
            text: name,
            alternateText: details?.login ? formatPhoneNumber(details.login) : undefined,
            icons: [{source: details?.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name, id: Number(accountID)}],
        };
    };

    // Stored as account IDs, which is what the `from` filter carries. A member whose personal details have not
    // loaded is listed under a generated ID, and one invited offline holds a temporary ID until the invite
    // syncs. Neither is an ID an expense carries, so picking them would save a rule that can never match.
    const submitterItems: RuleConditionItem[] = members
        .filter(
            ({hasKnownAccountID, details, policyEmployee}) =>
                hasKnownAccountID &&
                !details.isOptimisticPersonalDetail &&
                // A rule only ever matches an expense someone submitted, so a role that cannot create one names
                // nobody. `useWorkspaceMembers` keeps a pending removal listed while offline so the workspace
                // still shows it, which a picker of who may submit has no use for either.
                canRoleCreateExpenses(policyEmployee.role) &&
                policyEmployee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        )
        .map(({accountID, details}) => {
            const displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber});
            return {
                value: String(accountID),
                text: displayName,
                alternateText: formatPhoneNumber(details.login ?? ''),
                icons: [{source: details.avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
            };
        });

    return (
        <RuleConditionMultiSelectPage
            field="submittersToMatch"
            title={translate('common.submitter')}
            testID="AddSubmitterToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SUBMITTER_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={submitterItems}
            onSave={(submittersToMatch) => updateDraftMerchantRule({submittersToMatch})}
            getFallbackItem={getSubmitterFallbackItem}
        />
    );
}

export default AddSubmitterToMatchPage;
