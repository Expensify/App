import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type Props = {
    /** The policy ID of the workspace with the un-migrated NetSuite connection */
    policyID: string;

    /** The policy name shown as the subtitle */
    policyName: string;
};

function UpgradeNetSuiteConnection({policyID, policyName}: Props) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect']);

    return (
        <BaseWidgetItem
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM.UPGRADE_NETSUITE_CONNECTION}
            buttonSentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM_BUTTON.UPGRADE_NETSUITE_CONNECTION}
            icon={icons.Connect}
            title={translate('homePage.timeSensitiveSection.upgradeNetSuiteConnection.title')}
            subtitle={policyName}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID, CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.INSTALL, undefined, true))}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default UpgradeNetSuiteConnection;
