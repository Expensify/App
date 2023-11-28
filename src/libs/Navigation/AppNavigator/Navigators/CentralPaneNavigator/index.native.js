import React from 'react';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseCentralPaneNavigator from './BaseCentralPaneNavigator';

function CentralPaneNavigator() {
    return (
        <FreezeWrapper>
            <BaseCentralPaneNavigator />
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
