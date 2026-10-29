import {isProductMarketingAnnouncementDismissed} from '@libs/ProductMarketingWindowUtils';
import type {ProductMarketingAnnouncement} from '@libs/ProductMarketingWindowUtils';

const activeAnnouncement: ProductMarketingAnnouncement = {
    updateKey: 'productUpdateSeptember2026',
    visual: {type: 'illustration', name: 'Rules'},
    heading: 'productMarketingWindow.heading',
    body: 'productMarketingWindow.body',
    ctaLabel: 'common.learnMore',
    ctaUrl: 'https://help.expensify.com',
};

const OLDER_UPDATE_KEY = 'productUpdateAugust2026';
// A key a future release will add that this client has never heard of, which marks the client as stale.
const UNKNOWN_UPDATE_KEY = 'productUpdateOctober2026';

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

        it('returns true when the last dismissed key is unknown to this client', () => {
            expect(isProductMarketingAnnouncementDismissed(activeAnnouncement, UNKNOWN_UPDATE_KEY)).toBe(true);
        });
    });
});
