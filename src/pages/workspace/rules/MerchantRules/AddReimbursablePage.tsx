import React from 'react';
import RuleBooleanBase from '@components/Rule/RuleBooleanBase';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddReimbursablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE>;

function AddReimbursablePage({route}: AddReimbursablePageProps) {
    const policyID = route.params.policyID;

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const onSelect = (fieldID: string, value: boolean | undefined) => {
        updateDraftMerchantRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={CONST.MERCHANT_RULES.FIELDS.REIMBURSABLE}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.reimbursable"
            onSelect={onSelect}
            onBack={goBack}
        />
    );
}

AddReimbursablePage.displayName = 'AddReimbursablePage';

export default AddReimbursablePage;
