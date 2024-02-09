import {LaunchArguments} from 'react-native-launch-arguments';

type ExpectedArgs = {
    mockNetwork?: boolean;
};
const LaunchArgs = LaunchArguments.value<ExpectedArgs>();

export default LaunchArgs;
