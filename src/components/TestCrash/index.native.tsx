import Button from '@components/ButtonComposed';
import TestToolRow from '@components/TestToolRow';

import useLocalize from '@hooks/useLocalize';

import testCrash from '@libs/testCrash';

import CONST from '@src/CONST';

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
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={testCrash}
                >
                    <Button.Text>{toolRowTitle}</Button.Text>
                </Button>
            </TestToolRow>
        </View>
    );
}

export default TestCrash;
