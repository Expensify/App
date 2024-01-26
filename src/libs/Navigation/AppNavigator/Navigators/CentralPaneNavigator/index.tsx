import React from 'react';
import BaseCentralPaneNavigator from './BaseCentralPaneNavigator';

// We don't need to use freeze wraper on web because we don't render all report routes anyway.
// You can see this optimalization in the customStackNavigator.
function CentralPaneNavigator() {
    return <BaseCentralPaneNavigator />;
}

export default CentralPaneNavigator;
