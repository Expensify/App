import type {DestinationTreeSection} from '@libs/PerDiemRequestUtils';
import {getDestinationListSections, getSubratesFields, getTimeForDisplay} from '@libs/PerDiemRequestUtils';

import CONST from '@src/CONST';
import {getCustomUnitID} from '@src/libs/PerDiemRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import {de} from 'date-fns/locale/de';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {getFakePolicy, getFakeReport} from '../utils/LHNTestUtils';
import {translateLocal} from '../utils/TestHelper';

const policyID = '1';
const report: Report = {
    ...getFakeReport(),
    policyID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
};

const parentReport: Report = {
    ...getFakeReport(),
    policyID,
};

describe('PerDiemRequestUtils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() => {
        Onyx.clear();
    });

    it('getDestinationListSections()', () => {
        const tokenizeSearch = 'Antigua Barbuda';

        const destinations: Rate[] = [
            {
                currency: 'EUR',
                customUnitRateID: 'Afghanistan',
                enabled: true,
                name: 'Afghanistan',
                rate: 0,
            },
            {
                currency: 'EUR',
                customUnitRateID: 'Antigua and Barbuda',
                enabled: true,
                name: 'Antigua and Barbuda',
                rate: 0,
            },
        ];

        const searchResultList: DestinationTreeSection[] = [
            {
                data: [
                    {
                        currency: 'EUR',
                        isDisabled: false,
                        isSelected: false,
                        keyForList: 'Antigua and Barbuda',
                        searchText: 'Antigua and Barbuda',
                        text: 'Antigua and Barbuda',
                        tooltipText: 'Antigua and Barbuda',
                    },
                ],
                title: '',
                sectionIndex: 0,
            },
        ];

        const tokenizeSearchResult = getDestinationListSections({
            destinations,
            searchValue: tokenizeSearch,
            translate: translateLocal,
        });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });

    describe('getCustomUnitID', () => {
        it('should return the correct custom unit ID', async () => {
            const policy: Policy = {
                ...getFakePolicy(),
                id: policyID,
                customUnits: {
                    [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: {
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitID: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                        rates: {},
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            const customUnitID = getCustomUnitID(report, parentReport, policy);
            expect(customUnitID.customUnitID).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
        });

        it('should return fake P2P ID if the policy does not have a custom unit', async () => {
            const policy: Policy = {
                ...getFakePolicy(),
                customUnits: {},
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            const customUnitID = getCustomUnitID(report, parentReport, policy);
            expect(customUnitID.customUnitID).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });
    });

    describe('getSubratesFields', () => {
        const customUnit: CustomUnit = {
            customUnitID: 'unit',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            rates: {
                japan: {
                    customUnitRateID: 'japan',
                    name: 'Japan',
                    subRates: [
                        {id: 'fullDay', name: 'Full day', rate: 100},
                        {id: 'breakfast', name: 'Breakfast', rate: 10},
                    ],
                },
            },
        };

        it('returns one empty subrate row before a destination is picked', () => {
            // Given a per diem draft that has no destination yet, as the form now opens before one is picked
            const transaction: Transaction = {...createRandomTransaction(1), comment: {customUnit: {}}};

            // When the subrate rows are computed
            const fields = getSubratesFields(customUnit, transaction);

            // Then a single empty row is shown, so the user can see the subrate is still to fill in
            expect(fields).toEqual([undefined]);
        });

        it('adds an empty row after the picked subrates while the destination has more to pick', () => {
            // Given a draft with one of the destination's two subrates already picked
            const pickedSubrate = {id: 'fullDay', name: 'Full day', rate: 100, quantity: 1};
            const transaction: Transaction = {...createRandomTransaction(1), comment: {customUnit: {customUnitRateID: 'japan', subRates: [pickedSubrate]}}};

            // When the subrate rows are computed
            const fields = getSubratesFields(customUnit, transaction);

            // Then the picked subrate is followed by one empty row for the next one
            expect(fields).toEqual([pickedSubrate, undefined]);
        });
    });

    describe('getTimeForDisplay', () => {
        function buildPerDiemTransaction(start: string, end: string): Transaction {
            const transaction = createRandomTransaction(1);
            return {
                ...transaction,
                comment: {
                    ...transaction.comment,
                    customUnit: {customUnitID: 'per-diem', attributes: {dates: {start, end}}},
                },
            };
        }

        it('shows each time with a readable date instead of the machine date', () => {
            // Given a per-diem expense that runs from noon on one day to noon the next, read in UTC as the test runner is
            const transaction = buildPerDiemTransaction('2026-01-22T12:00:00Z', '2026-01-23T12:00:00Z');

            // When its time range is shown on the confirmation page
            // Then each end shows the time followed by a numeric date in the English order, rather than the `yyyy-MM-dd` it
            // is stored as
            expect(getTimeForDisplay(transaction, undefined)).toBe('12:00 PM, 01/22/2026 - 12:00 PM, 01/23/2026');
        });

        it('orders the date the way the language does', () => {
            // Given the same per-diem expense, shown to a German user
            const transaction = buildPerDiemTransaction('2026-01-22T12:00:00Z', '2026-01-23T12:00:00Z');

            // When its time range is shown on the confirmation page
            // Then the time still comes first, and the date uses the German day-first order and separators
            expect(getTimeForDisplay(transaction, de)).toBe('12:00, 22.01.2026 - 12:00, 23.01.2026');
        });

        it('leaves an end blank when its date cannot be read', () => {
            // Given a per-diem expense whose end date is not a valid date
            const transaction = buildPerDiemTransaction('2026-01-22T12:00:00Z', 'not a date');

            // When its time range is shown
            // Then the unreadable end is blank instead of the confirmation page throwing a RangeError
            expect(getTimeForDisplay(transaction, undefined)).toBe('12:00 PM, 01/22/2026 - ');
        });
    });
});
