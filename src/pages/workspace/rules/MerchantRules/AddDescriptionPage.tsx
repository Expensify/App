import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import MerchantRuleTextBasePage from './MerchantRuleTextBasePage';

type AddDescriptionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION>;

function AddDescriptionPage({route}: AddDescriptionPageProps) {
    const policyID = route.params?.policyID ?? '-1';

    return (
        <MerchantRuleTextBasePage
            fieldID={CONST.MERCHANT_RULES.FIELDS.DESCRIPTION}
            titleKey="common.description"
            testID="AddDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
            policyID={policyID}
        />
    );
}

AddDescriptionPage.displayName = 'AddDescriptionPage';

export default AddDescriptionPage;
