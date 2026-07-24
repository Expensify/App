import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';

import useLocalize from '@hooks/useLocalize';

import testCrash from '@libs/testCrash';

import React from 'react';
import {View} from 'react-native';

/**
 * Adds a button in native builds to test the Sentry crash reporting integration.
 */
function TestCrash() {
    const {translate} = useLocalize();

    const toolRowTitle = translate('initialSettingsPage.troubleshoot.testCrash');

    return (
        <View>
            <TestToolRow title={toolRowTitle}>
                <Button
                    small
                    text={toolRowTitle}
                    onPress={testCrash}
                />
            </TestToolRow>
        </View>
    );
}

export default TestCrash;
