import {NativeModules} from 'react-native';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';
import useLocalize from '@hooks/useLocalize';

export default function SoftKillTestToolRow() {
    const {translate} = useLocalize();

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.softKillTheApp')}>
            <Button
                small
                text={translate('initialSettingsPage.troubleshoot.kill')}
                onPress={() => NativeModules.TestToolsBridge.softKillApp()}
            />
        </TestToolRow>
    );
}
