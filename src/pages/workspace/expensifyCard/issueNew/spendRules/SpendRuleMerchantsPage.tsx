import SpendRuleMerchantsBase from '@components/SpendRules/configuration/SpendRuleMerchantsBase';

import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type SpendRuleMerchantsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANTS>;

export default function SpendRuleMerchantsPage({route}: SpendRuleMerchantsPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const merchantNames = issueNewCardForm?.data.spendRuleValue?.merchantNames ?? [];
    const merchantMatchTypes = issueNewCardForm?.data.spendRuleValue?.merchantMatchTypes ?? [];
    const restrictionAction = issueNewCardForm?.data.spendRuleValue?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchants = merchantNames.map((name, index) => ({name, matchType: merchantMatchTypes.at(index)}));

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <SpendRuleMerchantsBase
                policyID={policyID}
                action={restrictionAction}
                merchants={merchants}
                getEditMerchantRoute={(merchantIndex) => createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANT_EDIT.getRoute(merchantIndex))}
            />
        </AccessOrNotFoundWrapper>
    );
}
