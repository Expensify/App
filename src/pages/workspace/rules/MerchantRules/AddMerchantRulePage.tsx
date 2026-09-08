import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

import MerchantRulePageBase from './MerchantRulePageBase';

type AddMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_NEW>;

function AddMerchantRulePage({route}: AddMerchantRulePageProps) {
    const {policyID} = route.params;
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const [form, formMetadata] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    // The editor is always scoped to one rule type, which the chooser puts in the draft. A deep link straight here
    // carries no draft, so send it to the chooser rather than render an editor offering both conditions at once.
    const shouldRedirectToTypePicker = isRulesRevampEnabled && !isLoadingOnyxValue(formMetadata) && !form?.ruleType;

    useEffect(() => {
        if (!shouldRedirectToTypePicker) {
            return;
        }
        Navigation.navigate(ROUTES.RULES_EXPENSE_DEFAULT_TYPE.getRoute(policyID), {forceReplace: true});
    }, [shouldRedirectToTypePicker, policyID]);

    if (shouldRedirectToTypePicker) {
        return null;
    }

    return (
        <MerchantRulePageBase
            policyID={policyID}
            titleKey="workspace.rules.merchantRules.addRuleTitle"
            testID="AddMerchantRulePage"
        />
    );
}

AddMerchantRulePage.displayName = 'AddMerchantRulePage';

export default AddMerchantRulePage;
