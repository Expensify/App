import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_MERCHANT>;

function AddMerchantPage({route}: AddMerchantPageProps) {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.MERCHANT}
            hash={route.params?.hash}
            hintKey="expenseRulesPage.addRule.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
        />
    );
}

export default AddMerchantPage;
