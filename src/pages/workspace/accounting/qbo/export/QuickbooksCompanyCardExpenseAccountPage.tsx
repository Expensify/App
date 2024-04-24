import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksCompanyCardExpenseAccountPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {exportCompanyCardAccount, exportAccountPayable, autoCreateVendor, errorFields, pendingFields, exportCompanyCard} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isVendorSelected = exportCompanyCard === CONST.QUICKBOOKS_EXPORT_COMPANY_CARD.VENDOR_BILL;
    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    testID={QuickbooksCompanyCardExpenseAccountPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
                    <ScrollView contentContainerStyle={styles.pb2}>
                        <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>
                        <OfflineWithFeedback pendingAction={pendingFields?.exportCompanyCard}>
                            <MenuItemWithTopDescription
                                title={exportCompanyCard ? translate(`workspace.qbo.${exportCompanyCard}`) : undefined}
                                description={translate('workspace.qbo.exportCompany')}
                                error={errorFields?.exportCompanyCard ? translate('common.genericErrorMessage') : undefined}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID))}
                                brickRoadIndicator={exportCompanyCard ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                        {!!exportCompanyCard && (
                            <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1, styles.pb2]}>{translate(`workspace.qbo.${exportCompanyCard}Description`)}</Text>
                        )}
                        {isVendorSelected && (
                            <>
                                <OfflineWithFeedback pendingAction={pendingFields?.exportAccountPayable}>
                                    <MenuItemWithTopDescription
                                        title={exportAccountPayable}
                                        description={translate('workspace.qbo.accountsPayable')}
                                        error={errorFields?.exportAccountPayable ? translate('common.genericErrorMessage') : undefined}
                                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_PAYABLE_SELECT.getRoute(policyID))}
                                        brickRoadIndicator={exportAccountPayable ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        shouldShowRightIcon
                                    />
                                </OfflineWithFeedback>
                                <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1, styles.pb3]}>{translate('workspace.qbo.defaultVendorDescription')}</Text>
                                <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5]}>
                                    <View style={styles.flex1}>
                                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.defaultVendor')}</Text>
                                    </View>
                                    <OfflineWithFeedback pendingAction={pendingFields?.autoCreateVendor}>
                                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                            <Switch
                                                accessibilityLabel={translate('workspace.qbo.defaultVendor')}
                                                isOn={Boolean(autoCreateVendor)}
                                                onToggle={(isOn) =>
                                                    Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR, isOn)
                                                }
                                            />
                                        </View>
                                    </OfflineWithFeedback>
                                </View>
                            </>
                        )}
                        <OfflineWithFeedback pendingAction={pendingFields?.exportCompanyCardAccount}>
                            <MenuItemWithTopDescription
                                title={exportCompanyCardAccount}
                                description={isVendorSelected ? translate('workspace.qbo.vendor') : translate('workspace.qbo.account')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID))}
                                brickRoadIndicator={errorFields?.exportCompanyCardAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                shouldShowRightIcon
                                error={errorFields?.exportCompanyCardAccount ? translate('common.genericErrorMessage') : undefined}
                            />
                        </OfflineWithFeedback>
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountPage.displayName = 'QuickbooksCompanyCardExpenseAccountPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountPage);
