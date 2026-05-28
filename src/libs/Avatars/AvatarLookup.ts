import type {SvgProps} from 'react-native-svg';
import {AGENT_AVATARS} from './AgentAvatarCatalog';
import type {AvatarCatalogBase} from './AvatarCatalog';
import {USER_AVATARS} from './UserAvatarCatalog';

// Catalogs whose entries have CDN-backed URLs (i.e. not letter avatars).
// Keep this list in sync when adding a new catalog with `url` entries.
// Narrow catalogs are widened to AvatarCatalogBase for cross-catalog iteration.
const CATALOGS_WITH_CDN_URLS = [USER_AVATARS, AGENT_AVATARS] as unknown as AvatarCatalogBase[];

function findLocalAvatarForURL(source: unknown): React.FC<SvgProps> | undefined {
    if (typeof source !== 'string') {
        return undefined;
    }
    for (const catalog of CATALOGS_WITH_CDN_URLS) {
        const name = catalog.getNameFromURL(source);
        if (name) {
            return catalog.getLocal(name);
        }
    }
    return undefined;
}

function findAvatarIDFromURL(source: unknown): string | undefined {
    if (typeof source !== 'string') {
        return undefined;
    }
    for (const catalog of CATALOGS_WITH_CDN_URLS) {
        const name = catalog.getNameFromURL(source);
        if (name) {
            return name;
        }
    }
    return undefined;
}

function findCatalogURLForID(id: string): string | undefined {
    for (const catalog of CATALOGS_WITH_CDN_URLS) {
        if (catalog.isAvatarID(id)) {
            return catalog.getURL(id);
        }
    }
    return undefined;
}

export {findLocalAvatarForURL, findAvatarIDFromURL, findCatalogURLForID};
