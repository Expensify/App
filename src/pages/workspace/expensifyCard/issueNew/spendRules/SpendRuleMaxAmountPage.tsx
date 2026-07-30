import SpendRuleMaxAmountBase from '@components/SpendRules/configuration/SpendRuleMaxAmountBase';

import useOnyx from '@hooks/useOnyx';

import {setIssueNewCardData} from '@libs/actions/Card';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type SpendRuleMaxAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MAX_AMOUNT>;

export default function SpendRuleMaxAmountPage({route}: SpendRuleMaxAmountPageProps) {
    const {policyID} = route.params;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const defaultValue = issueNewCardForm?.data.spendRuleValue?.maxAmount ?? '';
    const selectedCurrency = issueNewCardForm?.data.currency ?? CONST.CURRENCY.USD;

    const handleMaxAmountChange = (maxAmount: string) => {
        setIssueNewCardData(policyID, {spendRuleValue: {maxAmount}});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <SpendRuleMaxAmountBase
                policyID={policyID}
                maxAmount={defaultValue}
                currencyCode={selectedCurrency}
                onMaxAmountChange={handleMaxAmountChange}
            />
        </AccessOrNotFoundWrapper>
    );
}
