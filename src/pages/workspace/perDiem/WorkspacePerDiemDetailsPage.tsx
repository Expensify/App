import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getAvailablePerDiemRate} from '@libs/PolicyPerDiemUtils';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {deleteWorkspacePerDiemRates} from '@userActions/Policy/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Rate, Subrate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useState} from 'react';

type WorkspacePerDiemDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_DETAILS>;

function WorkspacePerDiemDetailsPage({route}: WorkspacePerDiemDetailsPageProps) {
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {getCurrencySymbol, convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {canWrite: canWritePerDiem} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.PER_DIEM);
    const [deletingRate, setDeletingRate] = useState<{rate: Rate; subRate: Subrate}>();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const customUnit = getPerDiemCustomUnit(policy);
    const availableRate = getAvailablePerDiemRate(customUnit?.rates?.[rateID]);
    const fetchedSubRate = availableRate?.subRates?.find((subRate) => subRate.id === subRateID);
    const selectedRate = deletingRate?.rate ?? availableRate;
    const selectedSubRate = deletingRate?.subRate ?? fetchedSubRate;
    const isDeleting = !!deletingRate;

    const amountValue = selectedSubRate?.rate ? convertToDisplayStringWithoutCurrency(Number(selectedSubRate.rate)) : undefined;
    const currencyValue = selectedRate?.currency ? `${selectedRate.currency} - ${getCurrencySymbol(selectedRate.currency)}` : undefined;

    const handleDeletePerDiemRate = () => {
        if (!availableRate || !fetchedSubRate || isDeleting) {
            return;
        }
        // Keep the confirmed rate visible while navigation closes this page after the optimistic deletion.
        setDeletingRate({rate: availableRate, subRate: fetchedSubRate});
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
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack());
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.PER_DIEM}
            shouldBeBlocked={!isDeleting && isEmptyObject(fetchedSubRate)}
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
                    <MenuItemField
                        isDisabled={isDeleting}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.DETAILS_DESTINATION}
                        name={translate('common.destination')}
                        onPress={canWritePerDiem ? () => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_DESTINATION.getRoute(policyID, rateID, subRateID)) : undefined}
                        value={selectedRate?.name}
                    />
                    <MenuItemField
                        isDisabled={isDeleting}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.DETAILS_SUBRATE}
                        name={translate('common.subrate')}
                        onPress={canWritePerDiem ? () => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_SUBRATE.getRoute(policyID, rateID, subRateID)) : undefined}
                        value={selectedSubRate?.name}
                    />
                    <MenuItemField
                        isDisabled={isDeleting}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.DETAILS_AMOUNT}
                        name={translate('workspace.perDiem.amount')}
                        onPress={canWritePerDiem ? () => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_AMOUNT.getRoute(policyID, rateID, subRateID)) : undefined}
                        value={amountValue}
                    />
                    <MenuItemField
                        isDisabled={isDeleting}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.DETAILS_CURRENCY}
                        name={translate('common.currency')}
                        onPress={canWritePerDiem ? () => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_EDIT_CURRENCY.getRoute(policyID, rateID, subRateID)) : undefined}
                        value={currencyValue}
                    />
                    {canWritePerDiem && (
                        <MenuItemAction
                            isDisabled={isDeleting}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.DETAILS_DELETE}
                            icon={icons.Trashcan}
                            title={translate('common.delete')}
                            onPress={async () => {
                                const {action} = await showConfirmModal({
                                    title: translate('workspace.perDiem.deletePerDiemRate'),
                                    prompt: translate('workspace.perDiem.areYouSureDelete', {count: 1}),
                                    confirmText: translate('common.delete'),
                                    cancelText: translate('common.cancel'),
                                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                                });
                                if (action === ModalActions.CONFIRM) {
                                    handleDeletePerDiemRate();
                                }
                            }}
                        />
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemDetailsPage;
