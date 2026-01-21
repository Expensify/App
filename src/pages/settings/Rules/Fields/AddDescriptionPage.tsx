import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type AddDescriptionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_DESCRIPTION>;

function AddDescriptionPage({route}: AddDescriptionPageProps) {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.DESCRIPTION}
            hash={route.params?.hash}
            titleKey="common.description"
            testID="AddDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
        />
    );
}

export default AddDescriptionPage;
