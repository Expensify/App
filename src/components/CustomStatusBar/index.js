import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';

export default function CustomStatusBar() {
    useEffect(() => {
        StatusBar.setBarStyle('light-content', true);
    }, []);

    return <StatusBar />;
}
