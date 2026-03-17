import Onyx from 'react-native-onyx';
import type {DestinationTreeSection} from '@libs/PerDiemRequestUtils';
import {getDestinationListSections} from '@libs/PerDiemRequestUtils';
import CONST from '@src/CONST';
import {getCustomUnitID} from '@src/libs/PerDiemRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';
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
});
