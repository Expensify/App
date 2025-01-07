import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import * as PerDiem from '@libs/actions/Policy/PerDiem';
import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';

function generatePerDiemUnits(perDiemDestination: string[], perDiemSubRate: string[], perDiemCurrency: string[], perDiemAmount: string[]) {
    const perDiemUnits: Record<string, Rate> = {};
    for (let i = 0; i < perDiemDestination.length; i++) {
        perDiemUnits[perDiemDestination[i]] = perDiemUnits[perDiemDestination[i]] ?? {
            customUnitRateID: perDiemDestination.at(i),
            name: perDiemDestination.at(i),
            rate: 0,
            currency: perDiemCurrency.at(i),
            enabled: true,
            attributes: [],
            subRates: [],
        };
        perDiemUnits[perDiemDestination[i]].subRates?.push({
            id: PerDiem.generateCustomUnitID(),
            name: perDiemSubRate.at(i) ?? '',
            rate: Number(perDiemAmount.at(i)) ?? 0,
        });
    }
    return Object.values(perDiemUnits);
}

type ImportedPerDiemPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_IMPORTED>;
function ImportedPerDiemPage({route}: ImportedPerDiemPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingPerDiemRates, setIsImportingPerDiemRates] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.destination'), value: CONST.CSV_IMPORT_COLUMNS.DESTINATION, isRequired: true},
            {text: translate('common.subrate'), value: CONST.CSV_IMPORT_COLUMNS.SUBRATE, isRequired: true},
            {text: translate('common.currency'), value: CONST.CSV_IMPORT_COLUMNS.CURRENCY, isRequired: true},
            {text: translate('workspace.perDiem.amount'), value: CONST.CSV_IMPORT_COLUMNS.AMOUNT, isRequired: true},
        );

        return roles;
    };

    const columnRoles = getColumnRoles();

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        if (!requiredColumns.every((requiredColumn) => columns.includes(requiredColumn.value))) {
            // eslint-disable-next-line rulesdir/prefer-early-return
            requiredColumns.forEach((requiredColumn) => {
                if (!columns.includes(requiredColumn.value)) {
                    errors.required = translate('spreadsheet.fieldNotMapped', {fieldName: requiredColumn.text});
                }
            });
        } else {
            const duplicate = findDuplicate(columns);
            const duplicateColumn = columnRoles.find((role) => role.value === duplicate);
            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', {fieldName: duplicateColumn.text});
            } else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet?.columns, translate, columnRoles]);

    const importPerDiemRates = useCallback(() => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0 || !perDiemCustomUnit?.customUnitID) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const perDiemDestinationColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.DESTINATION);
        const perDiemSubRateColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.SUBRATE);
        const perDiemCurrencyColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.CURRENCY);
        const perDiemAmountColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.AMOUNT);
        const perDiemDestination = spreadsheet?.data[perDiemDestinationColumn].map((destination) => destination) ?? [];
        const perDiemSubRate = spreadsheet?.data[perDiemSubRateColumn].map((subRate) => subRate) ?? [];
        const perDiemCurrency = spreadsheet?.data[perDiemCurrencyColumn].map((currency) => sanitizeCurrencyCode(currency)) ?? [];
        const perDiemAmount = spreadsheet?.data[perDiemAmountColumn].map((amount) => amount) ?? [];
        const perDiemUnits = generatePerDiemUnits(
            perDiemDestination?.slice(containsHeader ? 1 : 0),
            perDiemSubRate?.slice(containsHeader ? 1 : 0),
            perDiemCurrency?.slice(containsHeader ? 1 : 0),
            perDiemAmount?.slice(containsHeader ? 1 : 0),
        );

        const rowsLength = perDiemDestination.length - (containsHeader ? 1 : 0);

        if (perDiemUnits) {
            setIsImportingPerDiemRates(true);
            PerDiem.importPerDiemRates(policyID, perDiemCustomUnit.customUnitID, perDiemUnits, rowsLength);
        }
    }, [validate, spreadsheet?.columns, spreadsheet?.data, containsHeader, policyID, perDiemCustomUnit?.customUnitID]);

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    const closeImportPageAndModal = () => {
        setIsImportingPerDiemRates(false);
        closeImportPage();
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID={ImportedPerDiemPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.perDiem.importPerDiemRates')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importPerDiemRates}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImportingPerDiemRates}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.CATEGORIES_ARTICLE_LINK}
            />

            <ConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                title={spreadsheet?.importFinalModal?.title ?? ''}
                prompt={spreadsheet?.importFinalModal?.prompt ?? ''}
                onConfirm={closeImportPageAndModal}
                onCancel={closeImportPageAndModal}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </ScreenWrapper>
    );
}

ImportedPerDiemPage.displayName = 'ImportedPerDiemPage';

export default ImportedPerDiemPage;
