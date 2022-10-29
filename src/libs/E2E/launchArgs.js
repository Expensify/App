import {NativeModules} from 'react-native';

const raw = NativeModules.LaunchArguments.value;
const parsed = {};
// eslint-disable-next-line guard-for-in,no-restricted-syntax
for (const k in raw) {
    const rawValue = raw[k];
    try {
        parsed[k] = JSON.parse(rawValue);
    } catch {
        parsed[k] = rawValue;
    }
}

const LaunchArguments = {
    value() {
        return parsed;
    },
};

export default LaunchArguments;
