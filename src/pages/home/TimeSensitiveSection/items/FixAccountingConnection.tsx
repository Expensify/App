import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type FixAccountingConnectionProps = {
    /** The connection name that has an error */
    connectionName: PolicyConnectionName;

    /** The policy ID associated with this connection */
    policyID: string;
};

function FixAccountingConnection({connectionName, policyID}: FixAccountingConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Exclamation'] as const);

    const integrationName = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];

    return (
        <BaseWidgetItem
            icon={icons.Exclamation}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine700}
            title={translate('homePage.timeSensitiveSection.fixAccountingConnection.title', {integrationName})}
            subtitle={translate('homePage.timeSensitiveSection.fixAccountingConnection.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID))}
            buttonProps={{danger: true}}
        />
    );
}

export default FixAccountingConnection;
