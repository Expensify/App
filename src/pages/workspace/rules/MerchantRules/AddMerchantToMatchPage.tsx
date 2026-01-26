import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import MerchantRuleTextBasePage from './MerchantRuleTextBasePage';

type AddMerchantToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH>;

function AddMerchantToMatchPage({route}: AddMerchantToMatchPageProps) {
    const policyID = route.params?.policyID ?? '-1';

    return (
        <MerchantRuleTextBasePage
            fieldID={CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH}
            hintKey="workspace.rules.merchantRules.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantToMatchPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            policyID={policyID}
        />
    );
}

AddMerchantToMatchPage.displayName = 'AddMerchantToMatchPage';

export default AddMerchantToMatchPage;
