import {NativeModules} from 'react-native';
import Button from '@components/Button';
import TestToolRow from '@components/TestToolRow';

export default function SoftKillTestToolRow() {
    return (
        <TestToolRow title="Soft kill the app">
            <Button
                small
                text="Kill"
                onPress={() => NativeModules.TestToolsBridge.softKillApp()}
            />
        </TestToolRow>
    );
}
