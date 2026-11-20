import October2026AdminPromoImage from '@assets/images/october2026-admin-promo.png';
import October2026PromoImage from '@assets/images/october2026-promo.png';

import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {toDate} from 'date-fns-tz';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

type ProductMarketingAnnouncementVisual =
    | {
          type: 'image';
          source: ImageSourcePropType;
      }
    | {
          type: 'illustration';
          name: IllustrationName;
      };

type ProductMarketingAnnouncementUpdateKey = ValueOf<typeof CONST.MARKETING_WINDOW_UPDATE_KEYS>;

/** A single product marketing announcement, resolved for the user's role. All content is authored by marketing per release. */
type ProductMarketingAnnouncement = {
    /** Stable key for this product update. A later update must use a new key. */
    updateKey: ProductMarketingAnnouncementUpdateKey;

    /** Marketing-supplied product screenshot or fallback illustration shown at the top of the window. */
    visual: ProductMarketingAnnouncementVisual;

    /** Short, bolded heading describing the feature being promoted. */
    heading: TranslationPaths;

    /** 1–2 sentences describing the feature and its benefit. */
    body: TranslationPaths;

    /** Label of the primary CTA button. */
    ctaLabel: TranslationPaths;

    /** External page the primary CTA opens in a new tab. */
    ctaUrl: string;

    /**
     * UTC publication time of this announcement in `yyyy-MM-dd HH:mm:ss` format. Role variants of the same
     * announcement share it. New accounts only see the announcement once seven days have passed since their
     * first sign-in and this time has passed.
     */
    releasedAt: string;
};

/**
 * Returns the single active product marketing announcement for the user's role, or null when no window should be shown.
 * Only one announcement can be active at a time — there is no stacking or queueing. When the active
 * announcement is dismissed, nothing is shown until a later release replaces it with a new update key.
 * Admins (admin on at least one workspace) see the admin variant, everyone else sees the member variant. Both variants
 * share the same update key so dismissing one also dismisses the other if the user's role changes.
 */
function getActiveProductMarketingAnnouncement(isAdmin: boolean): ProductMarketingAnnouncement | null {
    return {
        updateKey: CONST.MARKETING_WINDOW_UPDATE_KEYS.PRODUCT_UPDATE_OCTOBER_2026,
        visual: {type: 'image', source: isAdmin ? October2026AdminPromoImage : October2026PromoImage},
        heading: isAdmin ? 'productMarketingWindow.admin.heading' : 'productMarketingWindow.member.heading',
        body: isAdmin ? 'productMarketingWindow.admin.body' : 'productMarketingWindow.member.body',
        ctaLabel: 'common.learnMore',
        ctaUrl: isAdmin ? CONST.DISTANCE_RATES_AUTO_UPDATE_HELP_URL : CONST.DISTANCE_EXPENSES_FREQUENT_TRIPS_HELP_URL,
        releasedAt: '2026-10-01 00:00:00',
    };
}

/**
 * The instant the announcement becomes eligible to show based on the user's account age, in epoch milliseconds.
 * Returns:
 * - a number: eligibility starts at that instant (the later of seven days after first sign-in and the release time).
 * - null: the announcement can never show for this user, because it was released before their first sign-in.
 * - undefined: there is no usable first-sign-in marker yet, so callers should fall back to the existing behavior and
 *   not gate on account age. New accounts get the marker at first sign-in, so this only affects existing accounts whose
 *   marker has not been backfilled, which must not be regressed into hiding.
 */
function getProductMarketingAnnouncementEligibleAt(announcement: ProductMarketingAnnouncement | null, firstSignInDate: OnyxEntry<string>): number | null | undefined {
    if (!announcement || !firstSignInDate) {
        return undefined;
    }

    const firstSignInTime = toDate(firstSignInDate, {timeZone: 'UTC'}).getTime();
    const releasedTime = toDate(announcement.releasedAt, {timeZone: 'UTC'}).getTime();
    if (Number.isNaN(firstSignInTime) || Number.isNaN(releasedTime)) {
        return undefined;
    }

    if (releasedTime < firstSignInTime) {
        return null;
    }

    return Math.max(firstSignInTime + SEVEN_DAYS_IN_MS, releasedTime);
}

/**
 * Whether the announcement currently passes the account-age gate. A missing or invalid first-sign-in marker falls back
 * to eligible so existing accounts are not regressed. An announcement released before first sign-in is never eligible.
 */
function isProductMarketingAnnouncementEligibleByAccountAge(announcement: ProductMarketingAnnouncement | null, firstSignInDate: OnyxEntry<string>): boolean {
    const eligibleAt = getProductMarketingAnnouncementEligibleAt(announcement, firstSignInDate);
    if (eligibleAt === undefined) {
        return true;
    }

    return eligibleAt !== null && Date.now() >= eligibleAt;
}

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

export {getActiveProductMarketingAnnouncement, getProductMarketingAnnouncementEligibleAt, isProductMarketingAnnouncementDismissed, isProductMarketingAnnouncementEligibleByAccountAge};
export type {ProductMarketingAnnouncement};
