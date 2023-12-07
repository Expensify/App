import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import BlockingView from './BlockingView';

function FullPageOfflineBlockingView({children}: ChildrenProps) {
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
