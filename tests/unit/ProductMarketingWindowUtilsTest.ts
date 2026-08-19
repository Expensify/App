import {getProductMarketingAnnouncementVariant, isBrandNewUser, isProductMarketingAnnouncementDismissed} from '@libs/ProductMarketingWindowUtils';
import type {ProductMarketingAnnouncement} from '@libs/ProductMarketingWindowUtils';

import ROUTES from '@src/ROUTES';

const activeAnnouncement: ProductMarketingAnnouncement = {
    updateKey: 'productUpdateJuly2026',
    returningUserCutoffDate: new Date(2026, 6, 1),
    admin: {
        visual: {type: 'illustration', name: 'Rules'},
        heading: 'productMarketingWindow.roleTypes.admin.heading',
        body: 'productMarketingWindow.roleTypes.admin.body',
        ctaLabel: 'productMarketingWindow.roleTypes.admin.cta',
        getCtaRoute: () => ROUTES.WORKSPACES_LIST.getRoute(),
    },
    member: {
        visual: {type: 'illustration', name: 'MultiScan'},
        heading: 'productMarketingWindow.roleTypes.admin.heading',
        body: 'productMarketingWindow.roleTypes.admin.body',
        ctaLabel: 'productMarketingWindow.roleTypes.admin.cta',
        getCtaRoute: () => ROUTES.HOME,
    },
};
const adminOnlyAnnouncement: ProductMarketingAnnouncement = {
    updateKey: activeAnnouncement.updateKey,
    admin: activeAnnouncement.admin,
};
const announcementWithoutCutoff: ProductMarketingAnnouncement = {
    updateKey: activeAnnouncement.updateKey,
    admin: activeAnnouncement.admin,
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

    describe('isBrandNewUser', () => {
        it('returns false when there is no announcement', () => {
            expect(isBrandNewUser(null, '2026-08-01')).toBe(false);
        });

        it('returns false when the announcement has no returning-user cutoff', () => {
            expect(isBrandNewUser(announcementWithoutCutoff, '2026-08-01')).toBe(false);
        });

        it('returns false when the first workspace creation date is unknown', () => {
            expect(isBrandNewUser(activeAnnouncement, undefined)).toBe(false);
            expect(isBrandNewUser(activeAnnouncement, '')).toBe(false);
        });

        it('returns false for returning users whose first workspace predates the cutoff', () => {
            expect(isBrandNewUser(activeAnnouncement, '2026-06-15')).toBe(false);
        });

        it('returns true for brand-new users whose first workspace was created on or after the cutoff', () => {
            expect(isBrandNewUser(activeAnnouncement, '2026-07-01')).toBe(true);
            expect(isBrandNewUser(activeAnnouncement, '2026-08-15')).toBe(true);
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

        it('returns undefined for users without an active admin workspace when the announcement has no member variant', () => {
            expect(getProductMarketingAnnouncementVariant(adminOnlyAnnouncement, false, undefined)).toBeUndefined();
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
