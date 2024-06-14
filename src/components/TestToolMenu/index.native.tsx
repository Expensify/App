import React from 'react';
import BaseTestToolMenu from './BaseTestToolMenu';
import testCrash from '@libs/testCrash';
import Button from "@components/Button";
import TestToolRow from "@components/TestToolRow";
import useLocalize from "@hooks/useLocalize";

function TestToolMenu(props) {
    const {translate} = useLocalize();

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <BaseTestToolMenu {...props}>
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
