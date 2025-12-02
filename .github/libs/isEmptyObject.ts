type EmptyObject = Record<string, never>;

type EmptyValue = EmptyObject | null | undefined;

function isEmptyObject<T>(obj: T | EmptyValue): obj is EmptyValue {
    return Object.keys(obj ?? {}).length === 0;
}

export {isEmptyObject};
export type {EmptyObject};
