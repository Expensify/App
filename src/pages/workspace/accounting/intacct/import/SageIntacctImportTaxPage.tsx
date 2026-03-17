import React from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctSyncTaxConfiguration} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SageIntacctImportTaxPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX>;

function SageIntacctImportTaxPage({route}: SageIntacctImportTaxPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policy = usePolicy(route.params.policyID);
    const policyID = policy?.id;
    const sageIntacctConfig = policy?.connections?.intacct?.config;
    const sageIntacctData = policy?.connections?.intacct?.data;
    const isImportTaxEnabled = sageIntacctConfig?.tax?.syncTax ?? false;

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isImportTaxEnabled);

    return (
        <ConnectionLayout
            displayName="SageIntacctImportTaxPage"
            headerTitleAlreadyTranslated={translate('common.tax')}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID))}
        >
            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5]}>
                <Text style={[styles.textNormal]}>{translate('workspace.intacct.importTaxDescription')}</Text>
            </Text>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.intacct.importTaxDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={sageIntacctConfig?.tax?.syncTax ?? false}
                onToggle={() => updateSageIntacctSyncTaxConfiguration(policyID, !sageIntacctConfig?.tax?.syncTax)}
                pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.TAX, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig?.pendingFields)}
                errors={getLatestErrorField(sageIntacctConfig ?? {}, CONST.SAGE_INTACCT_CONFIG.TAX)}
                onCloseError={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.TAX)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.TAX, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={sageIntacctConfig?.tax?.taxSolutionID ?? sageIntacctData?.taxSolutionIDs?.at(0)}
                        description={translate('workspace.sageIntacct.taxSolution')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

export default SageIntacctImportTaxPage;
