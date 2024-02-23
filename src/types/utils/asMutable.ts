import type {Writable} from 'type-fest';

const asMutable = <T>(value: T): Writable<T> => value as Writable<T>;

export default asMutable;
