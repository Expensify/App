import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useCurrencyList from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {generateCustomUnitID, importPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

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
            id: generateCustomUnitID(),
            name: perDiemSubRate.at(i) ?? '',
            // Use Math.round to avoid floating point errors when converting decimal amounts to cents (e.g., 16.4 * 100 = 1639.9999...)
            rate: Math.round((Number(perDiemAmount.at(i)) ?? 0) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET),
        });
    }
    return Object.values(perDiemUnits);
}

type ImportedPerDiemPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_IMPORTED>;
function ImportedPerDiemPage({route}: ImportedPerDiemPageProps) {
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyList();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [isImportingPerDiemRates, setIsImportingPerDiemRates] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const {setIsClosing} = useCloseImportPage();

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

    const sanitizeCurrencyCode = (currencyCode: string) => {
        if (currencyList[currencyCode]) {
            return currencyCode;
        }
        // If the currency code is not found in the currency list, default to USD
        return CONST.CURRENCY.USD;
    };

    const validate = () => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const missingRequiredColumns = requiredColumns.find((requiredColumn) => !columns.includes(requiredColumn.value));
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', missingRequiredColumns.text);
        } else {
            const duplicate = findDuplicate(columns);
            const duplicateColumn = columnRoles.find((role) => role.value === duplicate);
            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', duplicateColumn.text);
            } else {
                errors = {};
            }
        }
        return errors;
    };

    const importRates = () => {
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
            importPerDiemRates(policyID, perDiemCustomUnit.customUnitID, perDiemUnits, rowsLength);
        }
    };

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingPerDiemRates(false);
        Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID="ImportedPerDiemPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.perDiem.importPerDiemRates')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importRates}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImportingPerDiemRates}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.CATEGORIES_ARTICLE_LINK}
            />

            <ImportSpreadsheetConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                closeImportPageAndModal={closeImportPageAndModal}
            />
        </ScreenWrapper>
    );
}

export default ImportedPerDiemPage;
