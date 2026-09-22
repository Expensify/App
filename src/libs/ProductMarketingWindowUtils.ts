import September2026PromoImage from '@assets/images/september2026-promo.png';

import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';

import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type ProductMarketingAnnouncementVisual =
    | {
          type: 'image';
          source: ImageSourcePropType;
      }
    | {
          type: 'illustration';
          name: IllustrationName;
      };

/** Where the primary CTA sends the user: an in-app route, or an external page opened in a new tab. */
type ProductMarketingCtaDestination =
    | {
          type: 'route';
          route: Route;
      }
    | {
          type: 'externalLink';
          url: string;
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

    /** Where the primary CTA sends the user. */
    ctaDestination: ProductMarketingCtaDestination;
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

/** September 2026 targets everyone, so both audiences share one variant instead of duplicating identical content. */
const september2026Variant: ProductMarketingAnnouncementVariant = {
    visual: {type: 'image', source: September2026PromoImage},
    heading: 'productMarketingWindow.heading',
    body: 'productMarketingWindow.body',
    ctaLabel: 'common.learnMore',
    ctaDestination: {type: 'externalLink', url: CONST.CLAUDE_MCP_HELP_URL},
};

/**
 * The single active product marketing announcement, or null when no window should be shown.
 * Only one announcement can be active at a time — there is no stacking or queueing. When the active
 * announcement is dismissed, nothing is shown until a later release replaces it with a new update key.
 */
const ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT: ProductMarketingAnnouncement | null = {
    updateKey: CONST.MARKETING_WINDOW_UPDATE_KEYS.PRODUCT_UPDATE_SEPTEMBER_2026,
    admin: september2026Variant,
    member: september2026Variant,
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
