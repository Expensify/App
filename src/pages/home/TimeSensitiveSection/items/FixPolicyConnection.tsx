import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type FixPolicyConnectionProps = {
    /** The connection name that has an error */
    connectionName: PolicyConnectionName;

    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** Human-readable integration name to render (e.g. "QuickBooks Online", "Gusto", "BambooHR"). */
    integrationName: string;
};

function FixPolicyConnection({connectionName, policyID, policyName, integrationName}: FixPolicyConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect']);

    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.fixPolicyConnection.subtitle', {policyName})
        : translate('homePage.timeSensitiveSection.fixPolicyConnection.defaultSubtitle');

    const isHRConnection = (CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES as readonly PolicyConnectionName[]).includes(connectionName);
    const fixRoute = isHRConnection ? ROUTES.WORKSPACE_HR.getRoute(policyID) : ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID);

    return (
        <BaseWidgetItem
            icon={icons.Connect}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={translate('homePage.timeSensitiveSection.fixPolicyConnection.title', {integrationName})}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(fixRoute)}
            buttonProps={{danger: true}}
        />
    );
}

export default FixPolicyConnection;
