import September2026PromoImage from '@assets/images/september2026-promo.png';

import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

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

type ProductMarketingAnnouncementUpdateKey = ValueOf<typeof CONST.MARKETING_WINDOW_UPDATE_KEYS>;

/** A single product marketing announcement, shown to every user. All content is authored by marketing per release. */
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
};

/**
 * The single active product marketing announcement, or null when no window should be shown.
 * Only one announcement can be active at a time — there is no stacking or queueing. When the active
 * announcement is dismissed, nothing is shown until a later release replaces it with a new update key.
 */
const ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT: ProductMarketingAnnouncement | null = {
    updateKey: CONST.MARKETING_WINDOW_UPDATE_KEYS.PRODUCT_UPDATE_SEPTEMBER_2026,
    visual: {type: 'image', source: September2026PromoImage},
    heading: 'productMarketingWindow.heading',
    body: 'productMarketingWindow.body',
    ctaLabel: 'common.learnMore',
    ctaUrl: CONST.CLAUDE_MCP_HELP_URL,
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

export {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, isProductMarketingAnnouncementDismissed};
export type {ProductMarketingAnnouncement};
