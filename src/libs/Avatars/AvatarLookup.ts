import type {SvgProps} from 'react-native-svg';
import {AGENT_AVATARS} from './AgentAvatarCatalog';
import type {AvatarCatalog} from './AvatarCatalog';
import {USER_AVATARS} from './UserAvatarCatalog';

// Catalogs whose entries are CDN-backed (not letter avatars), in lookup priority order.
const CDN_CATALOGS: Array<AvatarCatalog<string>> = [USER_AVATARS, AGENT_AVATARS];

function findCatalogMatchForURL(source: unknown): {catalog: AvatarCatalog<string>; id: string} | undefined {
    if (typeof source !== 'string') {
        return undefined;
    }
    for (const catalog of CDN_CATALOGS) {
        const id = catalog.getNameFromURL(source);
        if (id) {
            return {catalog, id};
        }
    }
    return undefined;
}

function findLocalAvatarForURL(source: unknown): React.FC<SvgProps> | undefined {
    const match = findCatalogMatchForURL(source);
    return match?.catalog.getLocal(match.id);
}

function findAvatarIDFromURL(source: unknown): string | undefined {
    return findCatalogMatchForURL(source)?.id;
}

export {findCatalogMatchForURL, findLocalAvatarForURL, findAvatarIDFromURL};
