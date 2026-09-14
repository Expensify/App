import useThemeStyles from '@hooks/useThemeStyles';

import ServerSelector from '@pages/settings/Troubleshoot/ServerSelector';

import React from 'react';
import {View} from 'react-native';

function TestToolsServerPage() {
    const styles = useThemeStyles();

    return (
        <View style={[styles.h100, styles.defaultModalContainer]}>
            <ServerSelector />
        </View>
    );
}

export default TestToolsServerPage;
