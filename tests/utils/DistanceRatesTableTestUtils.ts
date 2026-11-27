/** Rates and table rows for the distance rates table tests. */
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

const GOVERNMENT_RATE = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};

// Same amount and start date as the government rate it was created from, so its cell shows the bolt.
const AUTO_GENERATED_RATE: Rate = {
    customUnitRateID: 'auto',
    name: 'Government',
    rate: GOVERNMENT_RATE.rate,
    startDate: GOVERNMENT_RATE.startDate,
    currency: CONST.CURRENCY.GBP,
    enabled: true,
    attributes: {governmentRate: GOVERNMENT_RATE},
};

type BuildDistanceRateTableItemOptions = {
    canEditName?: boolean;
    canEditRate?: boolean;
};

function buildDistanceRateTableItem(rate: Rate, {canEditName = true, canEditRate = true}: BuildDistanceRateTableItemOptions = {}): DistanceRateTableItemData {
    return {
        keyForList: rate.customUnitRateID,
        rateID: rate.customUnitRateID,
        rate,
        formattedRate: `£${(rate.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET} / mile`,
        formattedTaxReclaimable: '',
        enabled: true,
        isLocked: false,
        action: jest.fn(),
        dismissError: jest.fn(),
        onToggleEnabled: jest.fn(),
        canEditName,
        onRenameName: jest.fn(),
        canEditRate,
        onChangeRate: jest.fn(),
        canEditTaxReclaimable: false,
        onChangeTaxReclaimable: jest.fn(),
    };
}

export {AUTO_GENERATED_RATE, buildDistanceRateTableItem};
