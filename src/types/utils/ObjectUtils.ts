import type {Entries} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/ban-types
function typedEntries<T extends object>(obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>;
}

export default {
    typedEntries,
};
