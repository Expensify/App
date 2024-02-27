import Config from 'react-native-config';

/**
 * Gets a config value or throws an error if the value is not defined.
 */
export default function getConfigValueOrThrow(key: string, config = Config): string {
    const value = config[key];
    if (value == null) {
        throw new Error(`Missing config value for ${key}`);
    }
    return value;
}
