import type {EmptyObject} from '@src/types/utils/EmptyObject';

function pick<TValue extends Record<string, unknown>, TKey extends keyof TValue>(object: TValue | null | undefined, keys: TKey[]): Pick<TValue, TKey> | EmptyObject {
    if (!object) {
        return {};
    }

    return keys.reduce((values, key) => (key in object ? {...values, [key]: object[key]} : values), {});
}

export default pick;
