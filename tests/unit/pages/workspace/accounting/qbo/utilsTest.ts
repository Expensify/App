import {areLocationsImportedAsTags} from '@pages/workspace/accounting/qbo/utils';
import CONST from '@src/CONST';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

const buildQBOConfig = (syncLocations?: QBOConnectionConfig['syncLocations']): QBOConnectionConfig =>
    ({
        syncLocations,
    }) as QBOConnectionConfig;

describe('areLocationsImportedAsTags', () => {
    it('returns false when QBO config is missing', () => {
        expect(areLocationsImportedAsTags()).toBe(false);
    });

    it('returns false when locations are not imported', () => {
        expect(areLocationsImportedAsTags(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE))).toBe(false);
    });

    it('returns false when locations are imported as report fields', () => {
        expect(areLocationsImportedAsTags(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD))).toBe(false);
    });

    it('returns true when locations are imported as tags', () => {
        expect(areLocationsImportedAsTags(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG))).toBe(true);
    });
});
