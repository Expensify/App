import Config from 'react-native-config';

/**
 * Gets a build-in config value or throws an error if the value is not defined.
 */
export default function getConfigValueOrThrow(key: string): string {
    const value = Config[key];
    if (value == null) {
        throw new Error(`Missing config value for ${key}`);
    }
    return value;
}
