import {getProductMarketingAnnouncementVariant, isProductMarketingAnnouncementDismissed} from '@libs/ProductMarketingWindowUtils';
import type {ProductMarketingAnnouncement} from '@libs/ProductMarketingWindowUtils';

import ROUTES from '@src/ROUTES';

const activeAnnouncement: ProductMarketingAnnouncement = {
    updateKey: 'productUpdateJuly2026',
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

const OLDER_UPDATE_KEY = 'productUpdateJune2026';

describe('ProductMarketingWindowUtils', () => {
    describe('isProductMarketingAnnouncementDismissed', () => {
        it('returns false when there is no announcement', () => {
            expect(isProductMarketingAnnouncementDismissed(null, activeAnnouncement.updateKey)).toBe(false);
        });

        it('returns false when no update was dismissed yet', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, undefined)).toBe(false);
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, '')).toBe(false);
        });

        it('returns true when the active update key matches the last dismissed key', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, activeAnnouncement.updateKey)).toBe(true);
        });

        it('returns false when the last dismissed key belongs to an older update', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, OLDER_UPDATE_KEY)).toBe(false);
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
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, false, activeAnnouncement.updateKey)).toBeUndefined();
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, true, activeAnnouncement.updateKey)).toBeUndefined();
        });

        it('still returns the active announcement variant when an older update was dismissed', () => {
            expect(getProductMarketingAnnouncementVariant(activeAnnouncement, false, OLDER_UPDATE_KEY)).toBe(activeAnnouncement.member);
        });
    });
});
