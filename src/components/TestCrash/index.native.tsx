import React from 'react';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';
import useLocalize from '@hooks/useLocalize';
import testCrash from '@libs/testCrash';
import {View} from "react-native";

const config = require('../../../firebase.json');

function TestCrash() {
    const {translate} = useLocalize();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isCrashlyticsDebugEnabled = config['react-native'].crashlytics_debug_enabled;

    return (
        <View>
            {isCrashlyticsDebugEnabled ? (
                <TestToolRow title={translate('initialSettingsPage.troubleshoot.nativeCrash')}>
                    <Button
                        small
                        text={translate('initialSettingsPage.troubleshoot.nativeCrash')}
                        onPress={() => {
                            testCrash();
                        }}
                    />
                </TestToolRow>
            ) : null}
        </View>
    );
}

export default TestCrash;
