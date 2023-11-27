import Falsy from './Falsy';

type EmptyObject = Record<string, never>;

// eslint-disable-next-line rulesdir/no-negated-variables
function isNotEmptyObject<T extends Record<string, unknown> | Falsy>(arg: T): arg is T {
    return Object.keys(arg ?? {}).length > 0;
}

function isEmptyObject<T extends Record<string, unknown> | Falsy>(obj: T): boolean {
    return Object.keys(obj ?? {}).length === 0;
}

export {isNotEmptyObject, isEmptyObject};
export type {EmptyObject};
