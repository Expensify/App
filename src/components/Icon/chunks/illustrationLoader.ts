import type IconAsset from '@src/types/utils/IconAsset';
import {isCoreIcon} from '@components/Icon/CORE_ICONS';
import {getCoreIcon} from '@libs/IconPreloader';
import {getIconChunk} from './smartChunks';

let expensiconsCache: Record<string, IconAsset> | null = null;

/**
 * Set the Expensicons cache (called by IconPreloader)
 */
const setExpensiconsCache = (expensicons: Record<string, IconAsset>) => {
    expensiconsCache = expensicons;
};

// Smart chunk loaders
const loadInboxIcon = (name: string) => {
    return import(/* webpackChunkName: "inbox-icons" */ './inbox.chunk').then((m) => {
        const module = m as Record<string, IconAsset>;
        return {default: module[name]};
    });
};

const loadReportsIcon = (name: string) => {
    return import(/* webpackChunkName: "reports-icons" */ './reports.chunk').then((m) => {
        const module = m as Record<string, IconAsset>;
        return {default: module[name]};
    });
};

const loadWorkspaceIcon = (name: string) => {
    return import(/* webpackChunkName: "workspace-icons" */ './workspace.chunk').then((m) => {
        const module = m as Record<string, IconAsset>;
        return {default: module[name]};
    });
};

const loadDecorativeIcon = (name: string) => {
    return import(/* webpackChunkName: "decorative-icons" */ './decorative.chunk').then((m) => {
        const module = m as Record<string, IconAsset>;
        return {default: module[name]};
    });
};

const loadSmartIllustration = (name: string) => {
    if (expensiconsCache?.[name]) {
        return Promise.resolve({default: expensiconsCache[name]});
    }

    if (isCoreIcon(name)) {
        const cachedIcon = getCoreIcon(name);
        if (cachedIcon) {
            return Promise.resolve({default: cachedIcon});
        }
    }

    const chunk = getIconChunk(name);

    switch (chunk) {
        case 'inbox':
            return loadInboxIcon(name);
        case 'reports':
            return loadReportsIcon(name);
        case 'workspace':
            return loadWorkspaceIcon(name);
        case 'decorative':
            return loadDecorativeIcon(name);
        default:
            return loadInboxIcon(name);
    }
};

const loadProductIllustration = (name: string) => loadSmartIllustration(name);
const loadSimpleIllustration = (name: string) => loadSmartIllustration(name);
const loadCompanyCardIllustration = (name: string) => loadSmartIllustration(name);
const loadOtherAsset = (name: string) => loadSmartIllustration(name);

export {
    loadSmartIllustration,
    setExpensiconsCache,
    loadProductIllustration,
    loadSimpleIllustration,
    loadCompanyCardIllustration,
    loadOtherAsset,
};