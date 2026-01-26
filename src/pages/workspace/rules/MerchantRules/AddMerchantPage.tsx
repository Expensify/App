import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import MerchantRuleTextBasePage from './MerchantRuleTextBasePage';

type AddMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT>;

function AddMerchantPage({route}: AddMerchantPageProps) {
    const policyID = route.params?.policyID ?? '-1';

    return (
        <MerchantRuleTextBasePage
            fieldID={CONST.MERCHANT_RULES.FIELDS.MERCHANT}
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            policyID={policyID}
        />
    );
}

AddMerchantPage.displayName = 'AddMerchantPage';

export default AddMerchantPage;
