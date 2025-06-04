import {addDays, differenceInDays, differenceInMinutes, startOfDay} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import {getTimeDifferenceIntervals} from '@libs/PerDiemRequestUtils';
import type Transaction from '@src/types/onyx/Transaction';

describe('getTimeDifferenceIntervals', () => {
    const createMockTransaction = (startDate: string, endDate: string): OnyxEntry<Transaction> =>
        ({
            comment: {
                customUnit: {
                    attributes: {
                        dates: {
                            start: startDate,
                            end: endDate,
                        },
                    },
                },
            },
        }) as OnyxEntry<Transaction>;

    it('calculates hours for same-day transactions', () => {
        // Given a transaction that starts and ends on the same day
        const startDate = '2024-03-20T09:00:00Z';
        const endDate = '2024-03-20T17:00:00Z';
        const transaction = createMockTransaction(startDate, endDate);

        const result = getTimeDifferenceIntervals(transaction);

        // When we calculate the time difference intervals
        const expectedHours = differenceInMinutes(new Date(endDate), new Date(startDate)) / 60;

        // Then we should get the correct number of hours for a single day, there should be no trip days and no last day
        expect(result).toEqual({
            firstDay: expectedHours,
            tripDays: 0,
            lastDay: undefined,
        });
    });

    it('calculates hours spanning two days', () => {
        // Given a transaction that spans across two days
        const startDate = '2024-03-20T14:00:00Z';
        const endDate = '2024-03-21T16:00:00Z';
        const transaction = createMockTransaction(startDate, endDate);

        const result = getTimeDifferenceIntervals(transaction);

        // When we calculate the time difference intervals
        const startDateTime = new Date(startDate);
        const firstDayDiff = differenceInMinutes(startOfDay(addDays(startDateTime, 1)), startDateTime);
        const lastDayDiff = differenceInMinutes(new Date(endDate), startOfDay(new Date(endDate)));

        // Then we should get the correct split of hours, there should be no trip days
        expect(result).toEqual({
            firstDay: firstDayDiff / 60,
            tripDays: 0,
            lastDay: lastDayDiff / 60,
        });
    });

    it('calculates hours for multi-day trips', () => {
        // Given a transaction that spans multiple days
        const startDate = '2024-03-20T16:00:00Z';
        const endDate = '2024-03-23T14:00:00Z';
        const transaction = createMockTransaction(startDate, endDate);

        const result = getTimeDifferenceIntervals(transaction);

        // When we calculate the time difference intervals
        const startDateTime = new Date(startDate);
        const firstDayDiff = differenceInMinutes(startOfDay(addDays(startDateTime, 1)), startDateTime);
        const tripDaysDiff = differenceInDays(startOfDay(new Date(endDate)), startOfDay(addDays(startDateTime, 1)));
        const lastDayDiff = differenceInMinutes(new Date(endDate), startOfDay(new Date(endDate)));

        // Then we should get the correct hours split, there should be trip days and last day
        expect(result).toEqual({
            firstDay: firstDayDiff / 60,
            tripDays: tripDaysDiff,
            lastDay: lastDayDiff / 60,
        });
    });
});
