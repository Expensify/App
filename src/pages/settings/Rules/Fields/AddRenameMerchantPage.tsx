import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddRenameMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_RENAME_MERCHANT>;

function AddRenameMerchantPage({route}: AddRenameMerchantPageProps) {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT}
            hash={route.params?.hash}
            titleKey="common.merchant"
            testID="AddRenameMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
        />
    );
}

export default AddRenameMerchantPage;
