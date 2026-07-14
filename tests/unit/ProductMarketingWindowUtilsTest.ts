import {getProductMarketingAnnouncementVariant, getProductMarketingWindowDismissedKey, isProductMarketingAnnouncementDismissed} from '@libs/ProductMarketingWindowUtils';
import type {ProductMarketingAnnouncement} from '@libs/ProductMarketingWindowUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';

const activeAnnouncement: ProductMarketingAnnouncement = {
    announcementID: 'activeAnnouncement-2026-07',
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
        getCtaRoute: () => ROUTES.HOME,
    },
};

// A previously active announcement whose ID may still have a dismissal stored in the NVP.
const OLDER_ANNOUNCEMENT_ID = 'olderAnnouncement-2026-06';

function buildDismissedProductTraining(announcementIDs: string[]): DismissedProductTraining {
    const dismissals: Record<string, {timestamp: string; dismissedMethod: 'click' | 'x'}> = {};
    for (const announcementID of announcementIDs) {
        dismissals[getProductMarketingWindowDismissedKey(announcementID)] = {timestamp: '2026-07-14 00:00:00.000', dismissedMethod: 'x'};
    }
    return dismissals as DismissedProductTraining;
}

describe('ProductMarketingWindowUtils', () => {
    describe('getProductMarketingWindowDismissedKey', () => {
        it('namespaces the dismissal key with the product marketing window prefix and the announcement ID', () => {
            expect(getProductMarketingWindowDismissedKey('activeAnnouncement-2026-07')).toBe(`${CONST.PRODUCT_MARKETING_WINDOW.DISMISSED_KEY_PREFIX}activeAnnouncement-2026-07`);
        });

        it('builds different keys for different announcement IDs', () => {
            expect(getProductMarketingWindowDismissedKey('a')).not.toBe(getProductMarketingWindowDismissedKey('b'));
        });
    });

    describe('isProductMarketingAnnouncementDismissed', () => {
        it('returns false when there is no announcement', () => {
            expect(isProductMarketingAnnouncementDismissed(null, buildDismissedProductTraining([OLDER_ANNOUNCEMENT_ID]))).toBe(false);
        });

        it('returns false when nothing was dismissed yet', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, undefined)).toBe(false);
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, buildDismissedProductTraining([]))).toBe(false);
        });

        it('returns true when the announcement itself was dismissed', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, buildDismissedProductTraining([activeAnnouncement.announcementID]))).toBe(true);
        });

        it('returns false when only a different announcement was dismissed', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, buildDismissedProductTraining([OLDER_ANNOUNCEMENT_ID]))).toBe(false);
        });
    });

    describe('getProductMarketingAnnouncementVariant', () => {
        it('returns undefined when no announcement is active', () => {
            expect(getProductMarketingAnnouncementVariant(null, true, undefined)).toBeUndefined();
            expect(getProductMarketingAnnouncementVariant(null, false, undefined)).toBeUndefined();
        });

        it('returns the member variant for users without an active admin workspace', () => {
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, false, undefined)).toBe(activeAnnouncement.member);
        });

        it('returns the admin variant for users with an active admin workspace, so admin prevails for users who are both member and admin', () => {
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, true, undefined)).toBe(activeAnnouncement.admin);
        });

        it('returns undefined once the active announcement is dismissed, without falling through to an older announcement', () => {
            // The older announcement was never dismissed, but dismissing the single active announcement must not
            // surface anything else — there is no queue of announcements to fall back to.
            const dismissedProductTraining = buildDismissedProductTraining([activeAnnouncement.announcementID]);
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, false, dismissedProductTraining)).toBeUndefined();
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, true, dismissedProductTraining)).toBeUndefined();
        });

        it('still returns the active announcement variant when only an older announcement was dismissed', () => {
            const dismissedProductTraining = buildDismissedProductTraining([OLDER_ANNOUNCEMENT_ID]);
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, false, dismissedProductTraining)).toBe(activeAnnouncement.member);
        });
    });
});
