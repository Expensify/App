import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';
import SidePanel from '@components/SidePanel';

import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

import React from 'react';

function RootNavigatorExtraContent({navigation, state}: ExtraContentProps) {
    return (
        <>
            {/* On web, the SidePanel is rendered outside of the main navigator so it can be positioned alongside the screen */}
            <SidePanel navigation={navigation} />
            {/* Rendered outside of the changing route screens so the window stays mounted while the user navigates */}
            <ProductMarketingWindowManager topmostRouteName={state.routes.at(-1)?.name} />
        </>
    );
}

export default RootNavigatorExtraContent;
