import React from 'react';
import RuleBooleanBasePage from '@components/Rule/RuleBooleanBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddBillablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_BILLABLE>;

function AddBillablePage({route}: AddBillablePageProps) {
    return (
        <RuleBooleanBasePage
            fieldID={CONST.EXPENSE_RULES.FIELDS.BILLABLE}
            hash={route.params?.hash}
            titleKey="common.billable"
        />
    );
}

export default AddBillablePage;
