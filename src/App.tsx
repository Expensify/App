import React from 'react';
import '../wdyr';
import BootSplash from './libs/BootSplash';
import TestComponent from './TestComponent';

function App() {
    BootSplash.hide();

    return <TestComponent />;
}

App.displayName = 'App';
export default App;
