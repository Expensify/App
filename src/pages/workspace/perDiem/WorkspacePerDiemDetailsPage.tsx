import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayStringWithoutCurrency, getCurrencySymbol} from '@libs/CurrencyUtils';
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
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const customUnit = getPerDiemCustomUnit(policy);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const selectedRate = customUnit?.rates?.[rateID];
    const fetchedSubRate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);
    const previousFetchedSubRate = usePrevious(fetchedSubRate);

    const selectedSubRate = fetchedSubRate ?? previousFetchedSubRate;

    const amountValue = selectedSubRate?.rate ? convertToDisplayStringWithoutCurrency(Number(selectedSubRate.rate)) : undefined;
    const currencyValue = selectedRate?.currency ? `${selectedRate.currency} - ${getCurrencySymbol(selectedRate.currency)}` : undefined;

    const handleDeletePerDiemRate = useCallback(() => {
        if (!customUnit || !selectedRate || !selectedSubRate) {
            return;
        }
        deleteWorkspacePerDiemRates(policyID, customUnit, [
            {
                destination: selectedRate.name ?? '',
                subRateName: selectedSubRate.name ?? '',
                rate: selectedSubRate.rate ?? 0,
                currency: selectedRate.currency ?? '',
                rateID,
                subRateID,
            },
        ]);
        Navigation.goBack();
    }, [customUnit, policyID, selectedRate, selectedSubRate, rateID, subRateID]);

    const showDeletePerDiemModal = () => {
        showConfirmModal({
            title: translate('workspace.perDiem.deletePerDiemRate'),
            prompt: translate('workspace.perDiem.areYouSureDelete', {count: 1}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            handleDeletePerDiemRate();
        });
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
                        icon={expensifyIcons.Trashcan}
                        title={translate('common.delete')}
                        onPress={showDeletePerDiemModal}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemDetailsPage;
