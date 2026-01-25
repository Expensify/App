import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrencyList from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspacePerDiemDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_DETAILS>;

function WorkspacePerDiemDetailsPage({route}: WorkspacePerDiemDetailsPageProps) {
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [deletePerDiemConfirmModalVisible, setDeletePerDiemConfirmModalVisible] = useState(false);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});

    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();
    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];
    const fetchedSubRate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);
    const previousFetchedSubRate = usePrevious(fetchedSubRate);

    const selectedSubRate = fetchedSubRate ?? previousFetchedSubRate;

    const amountValue = selectedSubRate?.rate ? convertToDisplayStringWithoutCurrency(Number(selectedSubRate.rate)) : undefined;
    const currencyValue = selectedRate?.currency ? `${selectedRate.currency} - ${getCurrencySymbol(selectedRate.currency)}` : undefined;

    const handleDeletePerDiemRate = () => {
        deleteWorkspacePerDiemRates(policyID, customUnit, [
            {
                destination: selectedRate?.name ?? '',
                subRateName: selectedSubRate?.name ?? '',
                rate: selectedSubRate?.rate ?? 0,
                currency: selectedRate?.currency ?? '',
                rateID,
                subRateID,
            },
        ]);
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
