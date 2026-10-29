import RuleBooleanBase from '@components/Rule/RuleBooleanBase';

import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import EXPENSE_RULE_INPUT_IDS from '@src/types/form/ExpenseRuleForm';

import React from 'react';

type AddBillablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_BILLABLE>;

function AddBillablePage({route}: AddBillablePageProps) {
    const hash = route.params?.hash;

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSelect = (fieldID: string, value: boolean | 'true' | 'false' | null) => {
        updateDraftRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={EXPENSE_RULE_INPUT_IDS.BILLABLE}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            titleKey="common.billable"
            onSelect={onSelect}
            onBack={goBack}
            hash={hash}
            useStringValues
        />
    );
}

export default AddBillablePage;
