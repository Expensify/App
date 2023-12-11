import Falsy from './Falsy';

type EmptyObject = Record<string, never>;

// eslint-disable-next-line rulesdir/no-negated-variables
function isNotEmptyObject<T extends Record<string, unknown> | Falsy>(arg: T | EmptyObject): arg is NonNullable<T> {
    return Object.keys(arg ?? {}).length > 0;
}

function isEmptyObject<T>(obj: T | EmptyObject | null | undefined): obj is EmptyObject {
    return Object.keys(obj ?? {}).length === 0;
}

export {isNotEmptyObject, isEmptyObject};
export type {EmptyObject};
