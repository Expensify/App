import React from 'react';
import SidePanel from '@components/SidePanel';
import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

function RootNavigatorExtraContent({navigation}: ExtraContentProps) {
    return (
        <>
            <SidePanel navigation={navigation} />
        </>
    );
}

export default RootNavigatorExtraContent;
