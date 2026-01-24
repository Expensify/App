import React from 'react';
import RuleBooleanBasePage from '@components/Rule/RuleBooleanBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddReimbursablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_REIMBURSABLE>;

function AddReimbursablePage({route}: AddReimbursablePageProps) {
    return (
        <RuleBooleanBasePage
            fieldID={CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE}
            hash={route.params?.hash}
            titleKey="common.reimbursable"
        />
    );
}

export default AddReimbursablePage;
