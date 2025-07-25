import CONST from '@src/CONST';
import {getCustomUnitID} from '@src/libs/PerDiemRequestUtils';
import type {Policy, Report} from '@src/types/onyx';
import {getFakePolicy, getFakeReport} from '../utils/LHNTestUtils';

describe('PerDiemRequestUtils', () => {
    describe('getCustomUnitID', () => {
        it('should return the correct custom unit ID', () => {
            const policy: Policy = {
                ...getFakePolicy(),
                customUnits: {
                    [CONST.CUSTOM_UNITS.FAKE_P2P_ID]: {
                        name: 'Fake P2P',
                        customUnitID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                        rates: {},
                    },
                },
            };

            const report: Report = {
                ...getFakeReport(),
                policyID: policy.id,
            };

            const parentReport: Report = {
                ...getFakeReport(),
                policyID: policy.id,
            };

            const customUnitID = getCustomUnitID(report, parentReport);
            expect(customUnitID.customUnitID).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });
    });
});
