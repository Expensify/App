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

const CERTINIA_FFA_EXPORT_STATUSES = [CONST.CERTINIA_EXPORT_STATUS.COMPLETE, CONST.CERTINIA_EXPORT_STATUS.IN_PROGRESS] as const;

type CertiniaMappingValue = ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>;
type CertiniaExportStatus = ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS>;
type CertiniaFFAExportStatus = TupleToUnion<typeof CERTINIA_FFA_EXPORT_STATUSES>;

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

function normalizeCertiniaExportStatus(status: string): string {
    return status.trim().toUpperCase().replaceAll(/\s+/g, '_');
}

/**
 * Maps a stored export status onto its native value. The config holds native values ("Complete", "In Progress",
 * "Approved", "Submitted"), but older app versions wrote uppercase identifiers ("APPROVED", "IN_PROGRESS",
 * "SUBMITTED"), so both forms are matched case- and separator-insensitively.
 */
function getCertiniaExportStatusValue(status: string | undefined): CertiniaExportStatus | undefined {
    if (!status) {
        return undefined;
    }

    const normalizedStatus = normalizeCertiniaExportStatus(status);
    return Object.values(CONST.CERTINIA_EXPORT_STATUS).find((value) => normalizeCertiniaExportStatus(value) === normalizedStatus);
}

/**
 * Same as getCertiniaExportStatusValue, but only returns statuses that apply to FFA payable invoices.
 */
function getCertiniaFFAExportStatusValue(status: string | undefined): CertiniaFFAExportStatus | undefined {
    const value = getCertiniaExportStatusValue(status);
    return CERTINIA_FFA_EXPORT_STATUSES.find((ffaStatus) => ffaStatus === value);
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
    CERTINIA_FFA_EXPORT_STATUSES,
    dimensionParamToNumber,
    getCertiniaFFAExportStatusValue,
    getDimensionLabel,
    getDisplayTypeLabel,
    isCertiniaDimensionParam,
    updateFinancialForceDimensionMapping,
};
export type {CertiniaDimensionParam, CertiniaFFAExportStatus, CertiniaMappingValue};
