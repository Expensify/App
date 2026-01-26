import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolation from '@hooks/useTransactionViolation';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearPolicyDistanceRateErrorFields, deletePolicyDistanceRates, setPolicyDistanceRatesEnabled} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Rate, TaxRateAttributes} from '@src/types/onyx/Policy';

type PolicyDistanceRateDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS>;

function PolicyDistanceRateDetailsPage({route}: PolicyDistanceRateDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`, {canBeMissing: true});
    const rateID = route.params.rateID;
    const customUnit = useMemo(() => getDistanceRateCustomUnit(policy), [policy]);
    const rate = customUnit?.rates[rateID];
    const customUnitID = customUnit?.customUnitID;

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
        canBeMissing: true,
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
                    transaction?.comment?.customUnit?.customUnitRateID &&
                    transaction?.comment?.customUnit?.customUnitRateID === rateID
                ) {
                    transactionIDs.add(transaction?.transactionID);
                }
                return transactionIDs;
            }, new Set<string>());
        },
        [customUnitID, rateID, policyReports],
    );

    const [eligibleTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
        canBeMissing: true,
    });

    const transactionViolations = useTransactionViolation(eligibleTransactionIDs);

    const currency = rate?.currency ?? CONST.CURRENCY.USD;
    const taxClaimablePercentage = rate?.attributes?.taxClaimablePercentage;
    const taxRateExternalID = rate?.attributes?.taxRateExternalID;

    const isDistanceTrackTaxEnabled = !!customUnit?.attributes?.taxEnabled;
    const isPolicyTrackTaxEnabled = !!policy?.tax?.trackingEnabled;
    const taxRate =
        taxRateExternalID && policy?.taxRates?.taxes[taxRateExternalID] ? `${policy?.taxRates?.taxes[taxRateExternalID]?.name} (${policy?.taxRates?.taxes[taxRateExternalID]?.value})` : '';
    // Rates can be disabled or deleted as long as in the remaining rates there is always at least one enabled rate and there are no pending delete action
    const canDisableOrDeleteRate = Object.values(customUnit?.rates ?? {}).some(
        (distanceRate: Rate) => distanceRate?.enabled && rateID !== distanceRate?.customUnitRateID && distanceRate?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
    const errorFields = rate?.errorFields;

    if (!rate) {
        return <NotFoundPage />;
    }

    const editRateName = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_NAME_EDIT.getRoute(policyID, rateID));
    };

    const editRateValue = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_EDIT.getRoute(policyID, rateID));
    };
    const editTaxReclaimableValue = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT.getRoute(policyID, rateID));
    };
    const editTaxRateValue = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT.getRoute(policyID, rateID));
    };

    const toggleRate = () => {
        if (!rate?.enabled || canDisableOrDeleteRate) {
            setPolicyDistanceRatesEnabled(policyID, customUnit, [{...rate, enabled: !rate?.enabled}]);
        } else {
            setIsWarningModalVisible(true);
        }
    };

    const deleteRate = () => {
        Navigation.goBack();
        deletePolicyDistanceRates(policyID, customUnit, [rateID], Array.from(eligibleTransactionIDs ?? []), transactionViolations);
        setIsDeleteModalVisible(false);
    };

    const rateValueToDisplay = convertAmountToDisplayString(rate?.rate, currency);
    const taxClaimableValueToDisplay = taxClaimablePercentage && rate.rate ? convertAmountToDisplayString(taxClaimablePercentage * rate.rate, currency) : '';
    const unitToDisplay = translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`);

    const clearErrorFields = (fieldName: keyof Rate | keyof TaxRateAttributes) => {
        clearPolicyDistanceRateErrorFields(policyID, customUnit.customUnitID, rateID, {...errorFields, [fieldName]: null});
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                testID="PolicyDistanceRateDetailsPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
            >
                <HeaderWithBackButton title={`${rateValueToDisplay} / ${translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`)}`} />
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    addBottomSafeAreaPadding
                >
                    <OfflineWithFeedback
                        errors={getLatestErrorField(rate ?? {}, 'enabled')}
                        pendingAction={rate?.pendingFields?.enabled}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearErrorFields('enabled')}
                    >
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.p5]}>
                            <Text>{translate('workspace.distanceRates.enableRate')}</Text>
                            <Switch
                                isOn={rate?.enabled ?? false}
                                onToggle={toggleRate}
                                accessibilityLabel={translate('workspace.distanceRates.enableRate')}
                                showLockIcon={!canDisableOrDeleteRate}
                            />
                        </View>
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={getLatestErrorField(rate ?? {}, 'name')}
                        pendingAction={rate?.pendingFields?.name}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearErrorFields('name')}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={rate.name}
                            description={translate('common.name')}
                            descriptionTextStyle={styles.textNormal}
                            onPress={editRateName}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={getLatestErrorField(rate ?? {}, 'rate')}
                        pendingAction={rate?.pendingFields?.rate ?? rate?.pendingFields?.currency}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearErrorFields('rate')}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={`${rateValueToDisplay} / ${unitToDisplay}`}
                            description={translate('workspace.distanceRates.rate')}
                            descriptionTextStyle={styles.textNormal}
                            onPress={editRateValue}
                        />
                    </OfflineWithFeedback>
                    {isDistanceTrackTaxEnabled && isPolicyTrackTaxEnabled && (
                        <OfflineWithFeedback
                            errors={getLatestErrorField(rate, 'taxRateExternalID')}
                            pendingAction={rate?.pendingFields?.taxRateExternalID}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearErrorFields('taxRateExternalID')}
                        >
                            <View style={styles.w100}>
                                <MenuItemWithTopDescription
                                    title={taxRate}
                                    description={translate('workspace.taxes.taxRate')}
                                    shouldShowRightIcon
                                    onPress={editTaxRateValue}
                                />
                            </View>
                        </OfflineWithFeedback>
                    )}
                    {isDistanceTrackTaxEnabled && !!taxRate && isPolicyTrackTaxEnabled && (
                        <OfflineWithFeedback
                            errors={getLatestErrorField(rate, 'taxClaimablePercentage')}
                            pendingAction={rate?.pendingFields?.taxClaimablePercentage}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearErrorFields('taxClaimablePercentage')}
                        >
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={taxClaimableValueToDisplay}
                                description={translate('workspace.taxes.taxReclaimableOn')}
                                descriptionTextStyle={styles.textNormal}
                                onPress={editTaxReclaimableValue}
                            />
                        </OfflineWithFeedback>
                    )}
                    <MenuItem
                        icon={icons.Trashcan}
                        title={translate('common.delete')}
                        onPress={() => {
                            if (canDisableOrDeleteRate) {
                                setIsDeleteModalVisible(true);
                                return;
                            }
                            setIsWarningModalVisible(true);
                        }}
                    />
                    <ConfirmModal
                        onConfirm={() => setIsWarningModalVisible(false)}
                        onCancel={() => setIsWarningModalVisible(false)}
                        isVisible={isWarningModalVisible}
                        title={translate('workspace.distanceRates.oopsNotSoFast')}
                        prompt={translate('workspace.distanceRates.workspaceNeeds')}
                        confirmText={translate('common.buttonConfirm')}
                        shouldShowCancelButton={false}
                    />
                    <ConfirmModal
                        title={translate('workspace.distanceRates.deleteDistanceRate')}
                        isVisible={isDeleteModalVisible}
                        onConfirm={deleteRate}
                        onCancel={() => setIsDeleteModalVisible(false)}
                        prompt={translate('workspace.distanceRates.areYouSureDelete', {count: 1})}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateDetailsPage;
