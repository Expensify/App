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
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const goBack = () => {
        const backRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    const onSelect = (fieldID: string, value: boolean | 'true' | 'false' | null) => {
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
