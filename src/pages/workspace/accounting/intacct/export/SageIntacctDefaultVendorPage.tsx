import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSageIntacctNonReimbursableActiveDefaultVendor, getSageIntacctVendors, settingsPendingAction} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {updateSageIntacctDefaultVendor} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Connections} from '@src/types/onyx/Policy';

type SageIntacctDefaultVendorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR>;

function SageIntacctDefaultVendorPage({route}: SageIntacctDefaultVendorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID ?? '-1';
    const policy = usePolicy(policyID);
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};

    const isReimbursable = route.params.reimbursable === CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE;

    let defaultVendor;
    let settingName: keyof Connections['intacct']['config']['export'];
    if (!isReimbursable) {
        const {nonReimbursable} = exportConfig ?? {};
        defaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
        settingName =
            nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE
                ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR
                : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR;
    } else {
        const {reimbursableExpenseReportDefaultVendor} = exportConfig ?? {};
        defaultVendor = reimbursableExpenseReportDefaultVendor;
        settingName = CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR;
    }

    const vendorSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctVendors(policy, defaultVendor), [defaultVendor, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.defaultVendorDescription', isReimbursable)}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal, isReimbursable],
    );

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (value !== defaultVendor) {
                updateSageIntacctDefaultVendor(policyID, settingName, value, defaultVendor);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID));
        },
        [defaultVendor, policyID, settingName],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.sageIntacct.noAccountsFound')}
                subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctDefaultVendorPage.displayName}
            sections={vendorSelectorOptions.length ? [{data: vendorSelectorOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={vendorSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() =>
                Navigation.goBack(
                    isReimbursable
                        ? ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID)
                        : ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID),
                )
            }
            title="workspace.sageIntacct.defaultVendor"
            listEmptyContent={listEmptyContent}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([settingName], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, settingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearSageIntacctErrorField(policyID, settingName)}
        />
    );
}

SageIntacctDefaultVendorPage.displayName = 'SageIntacctDefaultVendorPage';

export default SageIntacctDefaultVendorPage;
