import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSageIntacctNonReimbursableActiveDefaultVendor, getSageIntacctVendors, settingsPendingAction} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {updateSageIntacctDefaultVendor} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Connections} from '@src/types/onyx/Policy';

function SageIntacctDefaultVendorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR>>();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const backTo = route.params.backTo;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const isReimbursable = route.params.reimbursable === CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE;
    const goBack = useCallback(() => {
        Navigation.goBack(
            backTo ??
                (isReimbursable
                    ? ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID)
                    : ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)),
        );
    }, [backTo, policyID, isReimbursable]);

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
            goBack();
        },
        [defaultVendor, policyID, settingName, goBack],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.sageIntacct.noAccountsFound')}
                subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctDefaultVendorPage"
            data={vendorSelectorOptions ?? []}
            listItem={RadioListItem}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={vendorSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={goBack}
            title="workspace.sageIntacct.defaultVendor"
            listEmptyContent={listEmptyContent}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([settingName], config?.pendingFields)}
            errors={getLatestErrorField(config, settingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, settingName)}
        />
    );
}

export default SageIntacctDefaultVendorPage;
