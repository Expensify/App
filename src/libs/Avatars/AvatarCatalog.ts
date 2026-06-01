import type {SvgProps} from 'react-native-svg';

type AvatarEntry = {local: React.FC<SvgProps>; url: string};

type AvatarCatalog<ID extends string> = {
    entries: Record<ID, AvatarEntry>;
    ordered: Array<{id: ID} & AvatarEntry>;
    isAvatarID: (value: unknown) => value is ID;
    getNameFromURL: (url: string | undefined) => ID | undefined;
    getLocal: (id: string) => React.FC<SvgProps> | undefined;
    getURL: (id: string) => string | undefined;
    resolveURI: (id: string) => string;
};

function createAvatarCatalog<ID extends string>(entries: Record<ID, AvatarEntry>, ordered: Array<{id: ID} & AvatarEntry>): AvatarCatalog<ID> {
    const hasID = (id: string): id is ID => id in entries;
    return {
        entries,
        ordered,
        isAvatarID: (value): value is ID => typeof value === 'string' && hasID(value),
        getNameFromURL: (url) => {
            if (!url) {
                return undefined;
            }
            const name = url.split('/').at(-1)?.split('.').at(0) ?? '';
            return hasID(name) ? name : undefined;
        },
        getLocal: (id) => (hasID(id) ? entries[id].local : undefined),
        getURL: (id) => (hasID(id) ? entries[id].url : undefined),
        resolveURI: (id) => (hasID(id) ? entries[id].url : id),
    };
}

export {createAvatarCatalog};
export type {AvatarEntry, AvatarCatalog};
