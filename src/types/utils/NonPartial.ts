/**
 * Utility type to make all properties of an object non-optional with `undefined` as a possible value. It fixes the issue with `Required` utility type, which makes all properties required.
 * See https://github.com/microsoft/TypeScript/issues/31025 for more details.
 */
type NonPartial<T, RT extends T = Required<T>> = {[K in keyof RT]: K extends keyof T ? (undefined extends T[K] ? T[K] | undefined : T[K]) : never};

export default NonPartial;
