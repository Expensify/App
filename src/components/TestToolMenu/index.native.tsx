import React from 'react';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';
import useLocalize from '@hooks/useLocalize';
import testCrash from '@libs/testCrash';
import BaseTestToolMenu from './BaseTestToolMenu';

const config = require('../../../firebase.json');

function TestToolMenu() {
    const {translate} = useLocalize();

    const isCrashlyticsDebugEnabled = config['react-native'].crashlytics_debug_enabled;

    return (
        <BaseTestToolMenu>
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
        </BaseTestToolMenu>
    );
}

export default TestToolMenu;
