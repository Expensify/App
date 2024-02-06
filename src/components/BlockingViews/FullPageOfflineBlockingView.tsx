import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BlockingView from './BlockingView';

function FullPageOfflineBlockingView({children}: ChildrenProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const theme = useTheme();

    if (isOffline) {
        return (
            <BlockingView
                icon={Expensicons.OfflineCloud}
                iconColor={theme.offline}
                title={translate('common.youAppearToBeOffline')}
                subtitle={translate('common.thisFeatureRequiresInternet')}
            />
        );
    }

    return children;
}

FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';

export default FullPageOfflineBlockingView;
