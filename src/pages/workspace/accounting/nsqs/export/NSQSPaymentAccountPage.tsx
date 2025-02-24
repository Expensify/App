import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSPaymentAccount} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NSQSPaymentAccount} from '@src/types/onyx/Policy';

function NSQSPaymentAccountPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const nsqsConfig = policy?.connections?.netsuiteQuickStart?.config;
    const paymentAccount = nsqsConfig?.paymentAccount ?? '';
    const nsqsData = policy?.connections?.netsuiteQuickStart?.data;
    const paymentAccounts: NSQSPaymentAccount[] = useMemo(() => nsqsData?.paymentAccounts ?? [], [nsqsData?.paymentAccounts]);

    const defaultPaymentAccount: NSQSPaymentAccount = useMemo(
        () => ({
            id: '',
            name: translate(`workspace.nsqs.export.defaultPaymentAccount`),
            displayName: translate(`workspace.nsqs.export.defaultPaymentAccount`),
            number: '',
            type: '',
        }),
        [translate],
    );

    const sectionData: SelectorType[] = [defaultPaymentAccount, ...paymentAccounts].map((option) => ({
        keyForList: option.id,
        text: option.displayName,
        isSelected: option.id === paymentAccount,
        value: option.id,
    }));

    const updatePaymentAccount = useCallback(
        ({value}: SelectorType) => {
            if (!policyID) {
                return;
            }

            if (value !== paymentAccount) {
                updateNSQSPaymentAccount(policyID, value, paymentAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID));
        },
        [policyID, paymentAccount],
    );

    const headerContent = useMemo(() => <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.nsqs.export.paymentAccountDescription')}</Text>, [translate, styles.pb5, styles.ph5]);

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NSQSPaymentAccountPage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updatePaymentAccount}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID)) : undefined}
            title="workspace.nsqs.export.paymentAccount"
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.PAYMENT_ACCOUNT], nsqsConfig?.pendingFields)}
            errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.PAYMENT_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={policyID ? () => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.PAYMENT_ACCOUNT) : undefined}
        />
    );
}

NSQSPaymentAccountPage.displayName = 'NSQSPaymentAccountPage';

export default withPolicyConnections(NSQSPaymentAccountPage);
