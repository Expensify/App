import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import BlockingView from './BlockingView';

type FullPageOfflineBlockingViewProps = {
    /** Child elements */
    children: React.ReactNode;
};

function FullPageOfflineBlockingView({children}: FullPageOfflineBlockingViewProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    if (isOffline) {
        return (
            <BlockingView
                icon={Expensicons.OfflineCloud}
                title={translate('common.youAppearToBeOffline')}
                subtitle={translate('common.thisFeatureRequiresInternet')}
            />
        );
    }

    return children;
}

FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';

export default FullPageOfflineBlockingView;
