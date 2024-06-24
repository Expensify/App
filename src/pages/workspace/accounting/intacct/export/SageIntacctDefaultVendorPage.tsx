import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctNonReimbursableActiveDefaultVendor, getSageIntacctVendors} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SageIntacctDefaultVendorPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR>;

function SageIntacctDefaultVendorPage({route}: SageIntacctDefaultVendorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const isReimbursable = route.params.reimbursable === 'reimbursable';

    let defaultVendor;
    if (!isReimbursable) {
        defaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
    } else {
        const {reimbursableExpenseReportDefaultVendor} = policy?.connections?.intacct?.config.export ?? {};
        defaultVendor = reimbursableExpenseReportDefaultVendor;
    }

    const vendorSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctVendors(policy ?? undefined, defaultVendor), [defaultVendor, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.defaultVendorDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (value !== defaultVendor) {
                let settingValue;
                if (isReimbursable) {
                    settingValue = {reimbursableExpenseReportDefaultVendor: value};
                } else {
                    const {nonReimbursable} = policy?.connections?.intacct?.config.export ?? {};
                    settingValue =
                        nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE
                            ? {
                                  nonReimbursableCreditCardChargeDefaultVendor: value,
                              }
                            : {nonReimbursableVendor: value};
                }
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.XERO_CONFIG.EXPORT, settingValue);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID));
        },
        [policyID, defaultVendor],
    );

    // TODO: test on empty list
    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noAccountsFound')}
                subtitle={translate('workspace.xero.noAccountsFoundDescription')}
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
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        />
    );
}

SageIntacctDefaultVendorPage.displayName = 'PolicySageIntacctDefaultVendorPage';

export default SageIntacctDefaultVendorPage;
