import React, {useCallback, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolation from '@hooks/useTransactionViolation';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {deleteWorkspacePerDiemRates} from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspacePerDiemDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_DETAILS>;

function WorkspacePerDiemDetailsPage({route}: WorkspacePerDiemDetailsPageProps) {
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [deletePerDiemConfirmModalVisible, setDeletePerDiemConfirmModalVisible] = useState(false);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const customUnit = getPerDiemCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID;

    const selectedRate = customUnit?.rates?.[rateID];
    const fetchedSubRate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);
    const previousFetchedSubRate = usePrevious(fetchedSubRate);
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const selectedSubRate = fetchedSubRate ?? previousFetchedSubRate;

    const amountValue = selectedSubRate?.rate ? convertToDisplayStringWithoutCurrency(Number(selectedSubRate.rate)) : undefined;
    const currencyValue = selectedRate?.currency ? `${selectedRate.currency} - ${getCurrencySymbol(selectedRate.currency)}` : undefined;

    // Check if deleting this subrate will fully remove the rate (last subrate)
    const willFullyDeleteRate = (selectedRate?.subRates?.length ?? 0) <= 1;

    const policyReportsSelector = useCallback(
        (reports: OnyxCollection<Report>) => {
            return Object.values(reports ?? {}).reduce((reportIDs, report) => {
                if (report && report.policyID === policyID) {
                    reportIDs.add(report.reportID);
                }
                return reportIDs;
            }, new Set<string>());
        },
        [policyID],
    );

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: policyReportsSelector,
    });

    const transactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            return Object.values(transactions ?? {}).reduce((transactionIDs, transaction) => {
                if (
                    transaction &&
                    transaction.reportID &&
                    policyReports?.has(transaction.reportID) &&
                    customUnitID &&
                    transaction?.comment?.customUnit?.customUnitID === customUnitID &&
                    transaction?.comment?.customUnit?.customUnitRateID === rateID
                ) {
                    transactionIDs.add(transaction.transactionID);
                }
                return transactionIDs;
            }, new Set<string>());
        },
        [customUnitID, rateID, policyReports],
    );

    const [eligibleTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
    });

    const transactionViolations = useTransactionViolation(eligibleTransactionIDs);

    const handleDeletePerDiemRate = () => {
        const transactionIDsAffected = willFullyDeleteRate ? Array.from(eligibleTransactionIDs ?? []) : [];

        deleteWorkspacePerDiemRates(
            policyID,
            customUnit,
            [
                {
                    destination: selectedRate?.name ?? '',
                    subRateName: selectedSubRate?.name ?? '',
                    rate: selectedSubRate?.rate ?? 0,
                    currency: selectedRate?.currency ?? '',
                    rateID,
                    subRateID,
                },
            ],
            transactionIDsAffected,
            transactionViolations,
        );
        setDeletePerDiemConfirmModalVisible(false);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            shouldBeBlocked={isEmptyObject(selectedSubRate)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspacePerDiemDetailsPage"
            >
                <HeaderWithBackButton title={translate('workspace.perDiem.editPerDiemRate')} />
                <ConfirmModal
                    isVisible={deletePerDiemConfirmModalVisible}
                    onConfirm={handleDeletePerDiemRate}
                    onCancel={() => setDeletePerDiemConfirmModalVisible(false)}
                    title={translate('workspace.perDiem.deletePerDiemRate')}
                    prompt={translate('workspace.perDiem.areYouSureDelete', {count: 1})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ScrollView
                    addBottomSafeAreaPadding
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="always"
                >
                    <MenuItemWithTopDescription
                        title={selectedRate?.name}
                        description={translate('common.destination')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_DESTINATION.getRoute(policyID, rateID, subRateID))}
                        shouldShowRightIcon
                    />
                    <MenuItemWithTopDescription
                        title={selectedSubRate?.name}
                        description={translate('common.subrate')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_SUBRATE.getRoute(policyID, rateID, subRateID))}
                        shouldShowRightIcon
                    />
                    <MenuItemWithTopDescription
                        title={amountValue}
                        description={translate('workspace.perDiem.amount')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_AMOUNT.getRoute(policyID, rateID, subRateID))}
                        shouldShowRightIcon
                    />
                    <MenuItemWithTopDescription
                        title={currencyValue}
                        description={translate('common.currency')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_CURRENCY.getRoute(policyID, rateID, subRateID))}
                        shouldShowRightIcon
                    />
                    <MenuItem
                        icon={icons.Trashcan}
                        title={translate('common.delete')}
                        onPress={() => setDeletePerDiemConfirmModalVisible(true)}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemDetailsPage;
