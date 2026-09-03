import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

import React from 'react';

type FixPolicyConnectionProps = {
    /** The connection name that has an error */
    connectionName: PolicyConnectionName;

    /** The policy ID associated with this connection */
    policyID: string;

    /** Human-readable integration name to render (e.g. "QuickBooks Online", "Gusto", "BambooHR"). */
    integrationName: string;
};

function FixPolicyConnection({connectionName, policyID, integrationName}: FixPolicyConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect']);

    const isHRConnection = (CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES as readonly PolicyConnectionName[]).includes(connectionName);
    const fixRoute = isHRConnection ? ROUTES.WORKSPACE_HR.getRoute(policyID) : ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID);

    return (
        <BaseWidgetItem
            icon={icons.Connect}
            title={translate('homePage.timeSensitiveSection.fixPolicyConnection.title', {integrationName})}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(fixRoute)}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default FixPolicyConnection;
