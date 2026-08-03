import Button from '@components/ButtonComposed';
import TestToolRow from '@components/TestToolRow';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import {NativeModules} from 'react-native';

export default function SoftKillTestToolRow() {
    const {translate} = useLocalize();

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.softKillTheApp')}>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={() => NativeModules.TestToolsBridge.softKillApp()}
            >
                <Button.Text>{translate('initialSettingsPage.troubleshoot.kill')}</Button.Text>
            </Button>
        </TestToolRow>
    );
}
