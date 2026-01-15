import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddReportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_REPORT>;

function AddReportPage({route}: AddReportPageProps) {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.REPORT}
            hash={route.params?.hash}
            labelKey="common.reportName"
            titleKey="expenseRulesPage.addRule.addToReport"
            testID="AddReportPage"
            characterLimit={CONST.REPORT_NAME_LIMIT}
        />
    );
}

export default AddReportPage;
