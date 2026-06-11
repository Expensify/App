import type {TupleToUnion, ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {
    updateFinancialForceDimension1Mapping,
    updateFinancialForceDimension2Mapping,
    updateFinancialForceDimension3Mapping,
    updateFinancialForceDimension4Mapping,
} from '@libs/actions/connections/FinancialForce';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const CERTINIA_DIMENSION_PARAMS = [
    CONST.CERTINIA_CONFIG.CODING_DIMENSION1,
    CONST.CERTINIA_CONFIG.CODING_DIMENSION2,
    CONST.CERTINIA_CONFIG.CODING_DIMENSION3,
    CONST.CERTINIA_CONFIG.CODING_DIMENSION4,
] as const;

type CertiniaDimensionParam = TupleToUnion<typeof CERTINIA_DIMENSION_PARAMS>;

type CertiniaMappingValue = ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>;
type CertiniaExportStatus = ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS>;

function dimensionParamToNumber(dimension: string): number {
    return Number(dimension.replace('dimension', ''));
}

function getDisplayTypeLabel(mappingValue: CertiniaMappingValue | undefined, translate: LocaleContextProps['translate']): string {
    const value = mappingValue ?? CONST.CERTINIA_MAPPING_VALUE.DEFAULT;
    return translate(`workspace.certinia.import.mappingTypes.${value}` as TranslationPaths);
}

function getDimensionLabel(dimension: CertiniaDimensionParam, translate: LocaleContextProps['translate']): string {
    return translate(`workspace.certinia.import.dimensions.${dimension}` as TranslationPaths);
}

function getCertiniaExportStatusValue(status: string | undefined): CertiniaExportStatus | undefined {
    if (!status) {
        return undefined;
    }

    const normalizedStatus = status.trim().toUpperCase().replaceAll(/\s+/g, '_');
    const found = Object.values(CONST.CERTINIA_EXPORT_STATUS).find((s) => s === normalizedStatus);
    if (found !== undefined) {
        return found;
    }

    return undefined;
}

function updateFinancialForceDimensionMapping(policyID: string | undefined, dimension: CertiniaDimensionParam, value: CertiniaMappingValue, previousValue: CertiniaMappingValue | null) {
    if (!policyID) {
        return;
    }

    switch (dimension) {
        case CONST.CERTINIA_CONFIG.CODING_DIMENSION1:
            updateFinancialForceDimension1Mapping(policyID, value, previousValue);
            break;
        case CONST.CERTINIA_CONFIG.CODING_DIMENSION2:
            updateFinancialForceDimension2Mapping(policyID, value, previousValue);
            break;
        case CONST.CERTINIA_CONFIG.CODING_DIMENSION3:
            updateFinancialForceDimension3Mapping(policyID, value, previousValue);
            break;
        case CONST.CERTINIA_CONFIG.CODING_DIMENSION4:
            updateFinancialForceDimension4Mapping(policyID, value, previousValue);
            break;
        default:
            break;
    }
}

function isCertiniaDimensionParam(dimension: string): dimension is CertiniaDimensionParam {
    return (CERTINIA_DIMENSION_PARAMS as readonly string[]).includes(dimension);
}

export {
    CERTINIA_DIMENSION_PARAMS,
    dimensionParamToNumber,
    getCertiniaExportStatusValue,
    getDimensionLabel,
    getDisplayTypeLabel,
    isCertiniaDimensionParam,
    updateFinancialForceDimensionMapping,
};
export type {CertiniaDimensionParam, CertiniaMappingValue};
