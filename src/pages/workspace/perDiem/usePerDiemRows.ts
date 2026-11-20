/**
 * Builds the rows of the Per Diem table from the rates of the policy.
 *
 * A workspace can have well over a hundred thousand subrates and the page renders on every selection change. The rows are
 * derived here, apart from the other hooks of the page, so React Compiler can keep them until their inputs change.
 */
import type {PerDiemTableRowData} from '@components/Tables/WorkspacePerDiemTable';

import useLocalize from '@hooks/useLocalize';

import {renamePerDiemDestinationInline, renamePerDiemSubrateInline, updatePerDiemAmountInline} from '@libs/actions/Policy/InlineEdit';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemRowKey} from '@libs/PolicyPerDiemUtils';
import showInlineEditError from '@libs/showInlineEditError';

import {clearPerDiemRateError} from '@userActions/Policy/PerDiem';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

type SubRateData = {
    pendingAction?: PendingAction;
    errors?: Errors | null;
    destination: string;
    subRateName: string;
    rate: number;
    currency: string;
    rateID: string;
    subRateID: string;
};

type UsePerDiemRowsParams = {
    customUnit: CustomUnit | undefined;
    isOffline: boolean;
    canWritePerDiem: boolean;
    policyID: string;
};

function getSubRatesData(rates: Record<string, Rate>) {
    const subRatesData: SubRateData[] = [];
    for (const rate of Object.values(rates)) {
        const subRates = rate.subRates;
        if (subRates) {
            for (const [index, subRate] of subRates.entries()) {
                subRatesData.push({
                    pendingAction: subRate.pendingAction ?? rate.pendingAction,
                    // Rate-level errors appear once; subrate errors appear on the row that was edited.
                    errors: rate.errorFields?.[subRate.id] ?? (index === 0 ? rate.errors : undefined),
                    destination: rate.name ?? '',
                    subRateName: subRate.name,
                    rate: subRate.rate,
                    currency: rate.currency ?? CONST.CURRENCY.USD,
                    rateID: rate.customUnitRateID,
                    subRateID: subRate.id,
                });
            }
        }
    }
    return subRatesData;
}

function getSelectableSubRatesByKey(allSubRates: SubRateData[]) {
    const selectableSubRatesByKey: Record<string, SubRateData> = {};
    for (const subRate of allSubRates) {
        if (subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            selectableSubRatesByKey[getPerDiemRowKey(subRate.rateID, subRate.subRateID)] = subRate;
        }
    }
    return selectableSubRatesByKey;
}

function usePerDiemRows({customUnit, isOffline, canWritePerDiem, policyID}: UsePerDiemRowsParams) {
    const {translate} = useLocalize();

    const openSubRateDetails = (rateID: string, subRateID: string) => {
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
    };

    const allSubRates = getSubRatesData(customUnit?.rates ?? CONST.EMPTY_OBJECT);
    const selectableSubRatesByKey = getSelectableSubRatesByKey(allSubRates);

    const perDiemRows: PerDiemTableRowData[] = allSubRates
        .filter((subRate) => isOffline || subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((subRate) => {
            const isDeleting = subRate.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            // Whether editing is paused by selection mode is decided by each row, so entering or leaving it doesn't rebuild every row.
            const canEdit = canWritePerDiem && !isDeleting;

            return {
                keyForList: getPerDiemRowKey(subRate.rateID, subRate.subRateID),
                subRateID: subRate.subRateID,
                rateID: subRate.rateID,
                destination: subRate.destination,
                subRateName: subRate.subRateName,
                rate: subRate.rate,
                currency: subRate.currency,
                formattedAmount: convertAmountToDisplayString(subRate.rate, subRate.currency),
                disabled: isDeleting,
                pendingAction: subRate.pendingAction,
                errors: subRate.errors,
                canEditDestination: canEdit,
                canEditSubrate: canEdit,
                canEditAmount: canEdit,
                action: () => openSubRateDetails(subRate.rateID, subRate.subRateID),
                onRenameDestination: (newName: string) => showInlineEditError(renamePerDiemDestinationInline(translate, policyID, subRate.rateID, customUnit, subRate.destination, newName)),
                onRenameSubrate: (newName: string) =>
                    showInlineEditError(renamePerDiemSubrateInline(translate, policyID, subRate.rateID, subRate.subRateID, customUnit, subRate.subRateName, newName)),
                onChangeAmount: (newAmount: string) =>
                    showInlineEditError(updatePerDiemAmountInline(translate, policyID, subRate.rateID, subRate.subRateID, customUnit, subRate.rate, newAmount)),
                dismissError: () => {
                    if (!customUnit) {
                        return;
                    }
                    clearPerDiemRateError(policyID, customUnit.customUnitID, subRate.rateID, subRate.subRateID);
                },
            };
        });

    return {allSubRates, selectableSubRatesByKey, perDiemRows};
}

export default usePerDiemRows;
export type {SubRateData};
