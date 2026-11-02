import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type RetryFailedExportsProps = {
    policyID: string;
    policyName: string;

    /** Number of reports that the admin can export again */
    count: number;

    /** Name of the connected integration, for example "QuickBooks Online" */
    integrationName: string;
};

function RetryFailedExports({policyID, policyName, count, integrationName}: RetryFailedExportsProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Export']);

    return (
        <BaseWidgetItem
            icon={icons.Export}
            title={translate('homePage.timeSensitiveSection.retryFailedExports.title', {count, integrationName})}
            subtitle={translate('homePage.timeSensitiveSection.retryFailedExports.subtitle', {policyName})}
            ctaText={translate('common.review')}
            // Open the review page over Home, and do not switch the background to the workspace Accounting page.
            onCtaPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RETRY_FAILED_EXPORTS.getRoute(policyID), {skipMatchingFullScreenRoute: true})}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default RetryFailedExports;
