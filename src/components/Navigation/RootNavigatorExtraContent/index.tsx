import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';
import ProductMarketingWindowPortal from '@components/ProductMarketingWindow/ProductMarketingWindowPortal';
import SidePanel from '@components/SidePanel';

import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

import React from 'react';

function RootNavigatorExtraContent({navigation, state}: ExtraContentProps) {
    return (
        <>
            {/* On web, the SidePanel is rendered outside of the main navigator so it can be positioned alongside the screen */}
            <SidePanel navigation={navigation} />
            {/* Keep the window mounted across route changes and in the same body-level stacking context as the SidePanel so its z-index can place it above the panel. */}
            <ProductMarketingWindowPortal>
                <ProductMarketingWindowManager topmostRouteName={state.routes.at(-1)?.name} />
            </ProductMarketingWindowPortal>
        </>
    );
}

export default RootNavigatorExtraContent;
