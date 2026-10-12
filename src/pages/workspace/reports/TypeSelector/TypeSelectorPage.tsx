import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import FieldsTypeSelectorPage from '@pages/workspace/fields/FieldsTypeSelectorPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type TypeSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_TYPE_SELECTOR>;

function TypeSelectorPage({
    route: {
        params: {policyID, currentType},
    },
}: TypeSelectorPageProps) {
    return (
        <FieldsTypeSelectorPage
            policyID={policyID}
            currentType={currentType}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            createRoute={ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID)}
            subtitleKey="workspace.reportFields.typeInputSubtitle"
            testID="TypeSelectorPage"
        />
    );
}

export default TypeSelectorPage;
