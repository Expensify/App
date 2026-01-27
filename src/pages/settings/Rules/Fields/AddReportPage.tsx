import React, {useMemo} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import RuleTextBase from '@components/Rule/RuleTextBase';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddReportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_REPORT>;

function AddReportPage({route}: AddReportPageProps) {
    const hash = route.params?.hash;

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        updateDraftRule(values);
        goBack();
    };

    const ContentWrapper = useMemo(
        () =>
            ({children}: {children: React.ReactNode}) => <RuleNotFoundPageWrapper hash={hash}>{children}</RuleNotFoundPageWrapper>,
        [hash],
    );

    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.REPORT}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            labelKey="common.reportName"
            titleKey="expenseRulesPage.addRule.addToReport"
            testID="AddReportPage"
            characterLimit={CONST.REPORT_NAME_LIMIT}
            onSave={onSave}
            onBack={goBack}
            ContentWrapper={ContentWrapper}
        />
    );
}

export default AddReportPage;
