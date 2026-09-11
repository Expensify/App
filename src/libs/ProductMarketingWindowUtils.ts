import August2026PromoAdminsImage from '@assets/images/august2026-promo-admins.png';
import August2026PromoEmployeesImage from '@assets/images/august2026-promo-employees.png';

import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {hasVendorFeature} from './PolicyUtils';

type ProductMarketingAnnouncementVisual =
    | {
          type: 'image';
          source: ImageSourcePropType;
      }
    | {
          type: 'illustration';
          name: IllustrationName;
      };

type ProductMarketingCtaContext = {
    /** Admin workspace selected for the announcement. Undefined for member variants. */
    adminPolicy?: Policy;

    /** Whether the vendor-matching beta is enabled for the current account. */
    isVendorMatchingBetaEnabled: boolean;

    /** Whether connection hydration completed for the selected admin workspace. */
    isAdminPolicyConnectionDataAvailable: boolean;
};

/** One audience-specific content variant of a product marketing announcement. All content is authored by marketing per release. */
type ProductMarketingAnnouncementVariant = {
    /** Marketing-supplied product screenshot or fallback illustration shown at the top of the window. */
    visual: ProductMarketingAnnouncementVisual;

    /** Short, bolded heading describing the feature being promoted. */
    heading: TranslationPaths;

    /** 1–2 sentences describing the feature and its benefit. */
    body: TranslationPaths;

    /** Label of the primary CTA button. */
    ctaLabel: TranslationPaths;

    /** Builds the route the primary CTA navigates to using the selected audience and workspace context. */
    getCtaRoute: (context: ProductMarketingCtaContext) => Route;
};

type ProductMarketingAnnouncementUpdateKey = ValueOf<typeof CONST.MARKETING_WINDOW_UPDATE_KEYS>;

/** A single product marketing announcement with audience-targeted content variants. */
type ProductMarketingAnnouncement = {
    /** Stable key shared by every audience variant of this product update. A later update must use a new key. */
    updateKey: ProductMarketingAnnouncementUpdateKey;

    /** Variant shown to users who are an admin on at least one active workspace. Admin prevails when a user is both member and admin. */
    admin: ProductMarketingAnnouncementVariant;

    /** Optional variant shown to users without an admin role on any active workspace. */
    member?: ProductMarketingAnnouncementVariant;
};

/**
 * The single active product marketing announcement, or null when no window should be shown.
 * Only one announcement can be active at a time — there is no stacking or queueing. When the active
 * announcement is dismissed, nothing is shown until a later release replaces it with a new update key.
 */
const ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT: ProductMarketingAnnouncement | null = {
    updateKey: CONST.MARKETING_WINDOW_UPDATE_KEYS.PRODUCT_UPDATE_AUGUST_2026,
    admin: {
        visual: {type: 'image', source: August2026PromoAdminsImage},
        heading: 'productMarketingWindow.roleTypes.admin.heading',
        body: 'productMarketingWindow.roleTypes.admin.body',
        ctaLabel: 'productMarketingWindow.roleTypes.admin.cta',
        getCtaRoute: ({adminPolicy, isVendorMatchingBetaEnabled, isAdminPolicyConnectionDataAvailable}) => {
            if (isAdminPolicyConnectionDataAvailable && hasVendorFeature(adminPolicy, isVendorMatchingBetaEnabled)) {
                return ROUTES.WORKSPACE_VENDORS.getRoute(adminPolicy?.id);
            }
            return ROUTES.WORKSPACE_MORE_FEATURES.getRoute(adminPolicy?.id);
        },
    },
    member: {
        visual: {type: 'image', source: August2026PromoEmployeesImage},
        heading: 'productMarketingWindow.roleTypes.member.heading',
        body: 'productMarketingWindow.roleTypes.member.body',
        ctaLabel: 'productMarketingWindow.roleTypes.member.cta',
        getCtaRoute: () => ROUTES.SETTINGS_AGENTS_NEW.getRoute(),
    },
};

/**
 * Whether the given announcement was already dismissed by the user.
 * If the dismissed key from the BE doesn't exist in the client-side keys, we know that the user is on an older client
 * (and has seen a newer announcement on a different client), so we dont need to show the modal
 */
function isProductMarketingAnnouncementDismissed(announcement: ProductMarketingAnnouncement | null, lastDismissedMarketingWindow: OnyxEntry<string>): boolean {
    const isAnnouncementDismissed = !!announcement && announcement.updateKey === lastDismissedMarketingWindow;
    const isStale = !!lastDismissedMarketingWindow && !(Object.values(CONST.MARKETING_WINDOW_UPDATE_KEYS) as string[]).includes(lastDismissedMarketingWindow);
    return isAnnouncementDismissed || isStale;
}

/**
 * Resolves the content variant of the announcement the user should see, or undefined when no window should be shown.
 * Dismissal never falls through to another announcement — when the active announcement is dismissed, nothing is shown.
 */
function getProductMarketingAnnouncementVariant(
    announcement: ProductMarketingAnnouncement | null,
    hasActiveAdminPolicies: boolean,
    lastDismissedMarketingWindow: OnyxEntry<string>,
): ProductMarketingAnnouncementVariant | undefined {
    if (!announcement || isProductMarketingAnnouncementDismissed(announcement, lastDismissedMarketingWindow)) {
        return undefined;
    }
    return hasActiveAdminPolicies ? announcement.admin : announcement.member;
}

export {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, isProductMarketingAnnouncementDismissed, getProductMarketingAnnouncementVariant};
export type {ProductMarketingAnnouncement, ProductMarketingAnnouncementVariant};
