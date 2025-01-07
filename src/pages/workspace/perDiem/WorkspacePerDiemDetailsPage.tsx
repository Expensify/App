import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToFrontendAmountAsString, getCurrencySymbol} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PerDiem from '@userActions/Policy/PerDiem';
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
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];
    const selectedSubRate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);

    const amountValue = selectedSubRate?.rate ? convertToFrontendAmountAsString(Number(selectedSubRate.rate)) : undefined;
    const currencyValue = selectedRate?.currency ? `${selectedRate.currency} - ${getCurrencySymbol(selectedRate.currency)}` : undefined;

    const FullPageBlockingView = isEmptyObject(selectedSubRate) ? FullPageOfflineBlockingView : View;

    const handleDeletePerDiemRate = () => {
        PerDiem.deleteWorkspacePerDiemRates(policyID, customUnit, [
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
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspacePerDiemDetailsPage.displayName}
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
                <FullPageBlockingView style={!isEmptyObject(selectedSubRate) ? styles.flexGrow1 : []}>
                    <ScrollView
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
                            icon={Expensicons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => setDeletePerDiemConfirmModalVisible(true)}
                        />
                    </ScrollView>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspacePerDiemDetailsPage.displayName = 'WorkspacePerDiemDetailsPage';

export default WorkspacePerDiemDetailsPage;
