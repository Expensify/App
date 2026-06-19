import DateUtils from '@libs/DateUtils';
import getEventDateLabel from '@pages/Events/getEventDateLabel';
import type {Event} from '@src/types/onyx';

const translate = jest.fn();

describe('getEventDateLabel', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('formats a single-day event with a readable date', () => {
        jest.spyOn(DateUtils, 'formatToReadableString').mockReturnValue('Sep 12, 2026');

        const event: Event = {
            id: '1',
            name: 'TechCrunch Disrupt 2026',
            startDate: '2026-09-12',
            thumbnailUrl: 'https://example.com/event1.png',
        };

        expect(getEventDateLabel(event, translate)).toBe('Sep 12, 2026');
        expect(DateUtils.formatToReadableString).toHaveBeenCalledWith('2026-09-12');
    });

    it('formats a multi-day event with a localized date range', () => {
        jest.spyOn(DateUtils, 'getFormattedDateRange').mockReturnValue('Sep 12 – Sep 14, 2026');

        const event: Event = {
            id: '1',
            name: 'TechCrunch Disrupt 2026',
            startDate: '2026-09-12',
            endDate: '2026-09-14',
            thumbnailUrl: 'https://example.com/event1.png',
        };

        expect(getEventDateLabel(event, translate)).toBe('Sep 12 – Sep 14, 2026');
        expect(DateUtils.getFormattedDateRange).toHaveBeenCalledWith(translate, new Date('2026-09-12'), new Date('2026-09-14'));
    });

    it('treats matching start and end dates as a single-day event', () => {
        jest.spyOn(DateUtils, 'formatToReadableString').mockReturnValue('Sep 12, 2026');

        const event: Event = {
            id: '1',
            name: 'TechCrunch Disrupt 2026',
            startDate: '2026-09-12',
            endDate: '2026-09-12',
            thumbnailUrl: 'https://example.com/event1.png',
        };

        expect(getEventDateLabel(event, translate)).toBe('Sep 12, 2026');
        expect(DateUtils.formatToReadableString).toHaveBeenCalledWith('2026-09-12');
    });
});
