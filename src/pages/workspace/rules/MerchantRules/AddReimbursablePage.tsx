import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import MerchantRuleBooleanBasePage from './MerchantRuleBooleanBasePage';

type AddReimbursablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE>;

function AddReimbursablePage({route}: AddReimbursablePageProps) {
    const policyID = route.params?.policyID ?? '-1';

    return (
        <MerchantRuleBooleanBasePage
            fieldID={CONST.MERCHANT_RULES.FIELDS.REIMBURSABLE}
            titleKey="common.reimbursable"
            policyID={policyID}
        />
    );
}

AddReimbursablePage.displayName = 'AddReimbursablePage';

export default AddReimbursablePage;
