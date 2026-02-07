import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CreateFieldsPage from '@pages/workspace/fields/CreateFieldsPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CreateInvoiceFieldsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_FIELDS_CREATE>;

function CreateInvoiceFieldsPage({
    policy,
    route: {
        params: {policyID},
    },
}: CreateInvoiceFieldsPageProps) {
    return (
        <CreateFieldsPage
            policy={policy}
            policyID={policyID}
            isInvoiceField
            listValuesRoute={ROUTES.WORKSPACE_INVOICE_FIELDS_LIST_VALUES.getRoute(policyID)}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            testID="CreateInvoiceFieldsPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(CreateInvoiceFieldsPage);
