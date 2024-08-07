import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';
import useLocalize from '@hooks/useLocalize';
import testCrash from '@libs/testCrash';
import firebase from '../../../firebase.json';

/**
 * Adds a button in native dev builds to test the crashlytics integration with user info.
 */
function TestCrash() {
    const {translate} = useLocalize();

    const isCrashlyticsDebugEnabled = firebase?.['react-native']?.crashlytics_debug_enabled ?? false;

    const toolRowTitle = translate('initialSettingsPage.troubleshoot.testCrash');

    return (
        <View>
            {isCrashlyticsDebugEnabled || !__DEV__ ? (
                <TestToolRow title={toolRowTitle}>
                    <Button
                        small
                        text={toolRowTitle}
                        onPress={testCrash}
                    />
                </TestToolRow>
            ) : null}
        </View>
    );
}

export default TestCrash;
