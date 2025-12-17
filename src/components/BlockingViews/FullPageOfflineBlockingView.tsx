import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BlockingView from './BlockingView';

type FullPageOfflineBlockingViewProps = ChildrenProps & {
    /** Whether to add bottom safe area padding to the view. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
};

function FullPageOfflineBlockingView({children, addBottomSafeAreaPadding = true, addOfflineIndicatorBottomSafeAreaPadding = addBottomSafeAreaPadding}: FullPageOfflineBlockingViewProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);

    const theme = useTheme();

    if (isOffline) {
        return (
            <BlockingView
                icon={icons.OfflineCloud}
                iconColor={theme.offline}
                title={translate('common.youAppearToBeOffline')}
                subtitle={translate('common.thisFeatureRequiresInternet')}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
            />
        );
    }

    return children;
}

export default FullPageOfflineBlockingView;
