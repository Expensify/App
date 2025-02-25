import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BlockingView from './BlockingView';

type FullPageOfflineBlockingViewProps = ChildrenProps & {
    /**
     * Whether to add bottom safe area padding to the view.
     */
    addBottomSafeAreaPadding?: boolean;
};

function FullPageOfflineBlockingView({children, addBottomSafeAreaPadding = true}: FullPageOfflineBlockingViewProps) {
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
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        );
    }

    return children;
}

FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';

export default FullPageOfflineBlockingView;
