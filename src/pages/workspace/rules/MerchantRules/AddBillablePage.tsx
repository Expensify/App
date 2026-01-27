import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import MerchantRuleBooleanBasePage from './MerchantRuleBooleanBasePage';

type AddBillablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE>;

function AddBillablePage({route}: AddBillablePageProps) {
    return (
        <MerchantRuleBooleanBasePage
            fieldID={CONST.MERCHANT_RULES.FIELDS.BILLABLE}
            titleKey="common.billable"
            policyID={route.params.policyID}
        />
    );
}

AddBillablePage.displayName = 'AddBillablePage';

export default AddBillablePage;
