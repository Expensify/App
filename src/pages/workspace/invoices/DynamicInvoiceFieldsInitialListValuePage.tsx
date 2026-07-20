import useDynamicBackPath from '@hooks/useDynamicBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import FieldsInitialListValuePage from '@pages/workspace/fields/FieldsInitialListValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DynamicInvoiceFieldsInitialListValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_INVOICE_FIELDS_INITIAL_LIST_VALUE>;

function DynamicInvoiceFieldsInitialListValuePage({
    policy,
    route: {
        params: {policyID},
    },
}: DynamicInvoiceFieldsInitialListValuePageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVOICE_FIELDS_INITIAL_LIST_VALUE.path);

    return (
        <FieldsInitialListValuePage
            policy={policy}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            backPath={backPath}
            subtitleKey="workspace.invoiceFields.listValuesInputSubtitle"
            testID="DynamicInvoiceFieldsInitialListValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(DynamicInvoiceFieldsInitialListValuePage);
