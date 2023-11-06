import Falsy from './Falsy';

type EmptyObject = Record<string, never>;

// eslint-disable-next-line rulesdir/no-negated-variables
function isNotEmptyObject<T extends Record<string, unknown> | Falsy>(arg: T | EmptyObject): arg is T {
    return Object.keys(arg ?? {}).length > 0;
}

export default isNotEmptyObject;
export type {EmptyObject};
