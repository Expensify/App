import React from 'react';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';
import useLocalize from '@hooks/useLocalize';
import testCrash from '@libs/testCrash';
import BaseTestToolMenu from './BaseTestToolMenu';

function TestToolMenu() {
    const {translate} = useLocalize();

    return (
        <BaseTestToolMenu>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.nativeCrash')}>
                <Button
                    small
                    text={translate('initialSettingsPage.troubleshoot.nativeCrash')}
                    onPress={() => {
                        testCrash();
                    }}
                />
            </TestToolRow>
        </BaseTestToolMenu>
    );
}

export default TestToolMenu;
