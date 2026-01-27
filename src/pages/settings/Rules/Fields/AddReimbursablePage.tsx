import React from 'react';
import RuleBooleanBase from '@components/Rule/RuleBooleanBase';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddReimbursablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_REIMBURSABLE>;

function AddReimbursablePage({route}: AddReimbursablePageProps) {
    const hash = route.params?.hash;

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSelect = (fieldID: string, value: string) => {
        updateDraftRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            titleKey="common.reimbursable"
            onSelect={onSelect}
            onBack={goBack}
            ContentWrapper={({children}) => <RuleNotFoundPageWrapper hash={hash}>{children}</RuleNotFoundPageWrapper>}
        />
    );
}

export default AddReimbursablePage;
