import {canUseVendorBillForCompanyCardExport} from '@pages/workspace/accounting/qbo/utils';
import CONST from '@src/CONST';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

const buildQBOConfig = (syncLocations?: QBOConnectionConfig['syncLocations']): QBOConnectionConfig =>
    ({
        syncLocations,
    }) as QBOConnectionConfig;

describe('canUseVendorBillForCompanyCardExport', () => {
    it('allows vendor bill when QBO config is missing', () => {
        expect(canUseVendorBillForCompanyCardExport()).toBe(true);
    });

    it('allows vendor bill when locations are not imported', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE))).toBe(true);
    });

    it('allows vendor bill when locations are imported as report fields', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD))).toBe(true);
    });

    it('hides vendor bill when locations are imported as tags', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG))).toBe(false);
    });
});
