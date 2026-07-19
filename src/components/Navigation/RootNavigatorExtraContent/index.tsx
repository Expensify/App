import SidePanel from '@components/SidePanel';

import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

import React from 'react';

function RootNavigatorExtraContent({navigation}: ExtraContentProps) {
    return (
        <>
            {/* On web, the SidePanel is rendered outside of the main navigator so it can be positioned alongside the screen */}
            <SidePanel navigation={navigation} />
        </>
    );
}

export default RootNavigatorExtraContent;
