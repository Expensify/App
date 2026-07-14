import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import type {ProductMarketingWindowDismissedKey} from '@src/types/onyx/DismissedProductTraining';

import type {OnyxEntry} from 'react-native-onyx';

import {buildCannedSearchQuery} from './SearchQueryUtils';
import isProductTrainingElementDismissed from './TooltipUtils';

/** One audience-specific content variant of a product marketing announcement. All content is authored by marketing per release. */
type ProductMarketingAnnouncementVariant = {
    /** Illustration shown at the top of the window. */
    illustration: IllustrationName;

    /** Short, bolded heading describing the feature being promoted. */
    heading: TranslationPaths;

    /** 1–2 sentences describing the feature and its benefit. */
    body: TranslationPaths;

    /** Label of the primary CTA button. */
    ctaLabel: TranslationPaths;

    /** Builds the route the primary CTA navigates to. */
    getCtaRoute: () => Route;
};

/** A single product marketing announcement with audience-targeted content variants. */
type ProductMarketingAnnouncement = {
    /** Stable, unique ID of the announcement. Dismissal is stored per ID, so a new announcement needs a new ID to be eligible again. */
    announcementID: string;

    /** Variant shown to users who are an admin on at least one active workspace. Admin prevails when a user is both member and admin. */
    admin: ProductMarketingAnnouncementVariant;

    /** Variant shown to users without an admin role on any active workspace. */
    member: ProductMarketingAnnouncementVariant;
};

/**
 * The single active product marketing announcement, or null when no window should be shown.
 * Only one announcement can be active at a time — there is no stacking or queueing. When the active
 * announcement is dismissed, nothing is shown until a later release replaces it with a new ID.
 */
const ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT: ProductMarketingAnnouncement | null = {
    announcementID: 'expensePolicyPdf-2026-07',
    admin: {
        illustration: 'Rules',
        heading: 'productMarketingWindow.expensePolicyPdf.admin.heading',
        body: 'productMarketingWindow.expensePolicyPdf.admin.body',
        ctaLabel: 'productMarketingWindow.expensePolicyPdf.admin.cta',
        getCtaRoute: () => ROUTES.WORKSPACES_LIST.getRoute(),
    },
    member: {
        illustration: 'MultiScan',
        heading: 'productMarketingWindow.expensePolicyPdf.member.heading',
        body: 'productMarketingWindow.expensePolicyPdf.member.body',
        ctaLabel: 'productMarketingWindow.expensePolicyPdf.member.cta',
        getCtaRoute: () => ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE})}),
    },
};

/** Builds the dismissed product training NVP key for an announcement, namespaced so each announcement is dismissed independently. */
function getProductMarketingWindowDismissedKey(announcementID: string): ProductMarketingWindowDismissedKey {
    return `${CONST.PRODUCT_MARKETING_WINDOW.DISMISSED_KEY_PREFIX}${announcementID}`;
}

/** Whether the given announcement was already dismissed by the user. */
function isProductMarketingAnnouncementDismissed(announcement: ProductMarketingAnnouncement | null, dismissedProductTraining: OnyxEntry<DismissedProductTraining>): boolean {
    if (!announcement) {
        return false;
    }
    return isProductTrainingElementDismissed(getProductMarketingWindowDismissedKey(announcement.announcementID), dismissedProductTraining);
}

/**
 * Resolves the content variant of the announcement the user should see, or undefined when no window should be shown.
 * Dismissal never falls through to another announcement — when the active announcement is dismissed, nothing is shown.
 */
function getProductMarketingAnnouncementVariant(
    announcement: ProductMarketingAnnouncement | null,
    hasActiveAdminPolicies: boolean,
    dismissedProductTraining: OnyxEntry<DismissedProductTraining>,
): ProductMarketingAnnouncementVariant | undefined {
    if (!announcement || isProductMarketingAnnouncementDismissed(announcement, dismissedProductTraining)) {
        return undefined;
    }
    return hasActiveAdminPolicies ? announcement.admin : announcement.member;
}

export {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, getProductMarketingWindowDismissedKey, isProductMarketingAnnouncementDismissed, getProductMarketingAnnouncementVariant};
export type {ProductMarketingAnnouncement, ProductMarketingAnnouncementVariant};
