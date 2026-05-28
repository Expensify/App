import type {SvgProps} from 'react-native-svg';

type AvatarEntry = {local: React.FC<SvgProps>; url: string};

// Base shape for cross-catalog iteration. Specific catalogs widen `string` to their own ID literal union.
type AvatarCatalogBase = {
    entries: Record<string, AvatarEntry>;
    ordered: ReadonlyArray<{id: string} & AvatarEntry>;
    getLocal: (id: string) => React.FC<SvgProps> | undefined;
    getURL: (id: string) => string | undefined;
    isAvatarID: (value: unknown) => boolean;
    resolveURI: (id: string) => string;
    getNameFromURL: (url: string | undefined) => string | undefined;
};

type AvatarCatalog<ID extends string> = {
    entries: Record<ID, AvatarEntry>;
    ordered: Array<{id: ID} & AvatarEntry>;
    getLocal: (id: ID) => React.FC<SvgProps> | undefined;
    getURL: (id: ID) => string | undefined;
    isAvatarID: (value: unknown) => value is ID;
    resolveURI: (id: string) => string;
    getNameFromURL: (url: string | undefined) => ID | undefined;
};

function createAvatarCatalog<ID extends string>(entries: Record<ID, AvatarEntry>, ordered: Array<{id: ID} & AvatarEntry>): AvatarCatalog<ID> {
    return {
        entries,
        ordered,
        getLocal: (id) => entries[id]?.local,
        getURL: (id) => entries[id]?.url,
        isAvatarID: (value): value is ID => typeof value === 'string' && value in entries,
        resolveURI: (id) => (id in entries ? entries[id as ID].url : id),
        getNameFromURL: (url) => {
            if (!url || typeof url !== 'string') {
                return undefined;
            }
            const name = (url.split('/').at(-1)?.split('.').at(0) ?? '') as ID;
            return name in entries ? name : undefined;
        },
    };
}

export {createAvatarCatalog};
export type {AvatarEntry, AvatarCatalog, AvatarCatalogBase};
