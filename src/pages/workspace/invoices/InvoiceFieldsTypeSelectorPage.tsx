import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import FieldsTypeSelectorPage from '@pages/workspace/fields/FieldsTypeSelectorPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type InvoiceFieldsTypeSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_FIELDS_TYPE_SELECTOR>;

function InvoiceFieldsTypeSelectorPage({
    route: {
        params: {policyID, currentType},
    },
}: InvoiceFieldsTypeSelectorPageProps) {
    return (
        <FieldsTypeSelectorPage
            policyID={policyID}
            currentType={currentType}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            createRoute={ROUTES.WORKSPACE_INVOICE_FIELDS_CREATE.getRoute(policyID)}
            subtitleKey="workspace.invoiceFields.typeInputSubtitle"
            testID="InvoiceFieldsTypeSelectorPage"
        />
    );
}

export default InvoiceFieldsTypeSelectorPage;
