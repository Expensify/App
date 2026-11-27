/**
 * Picker for one of the two accounts of a UK/EU Expensify Card settlement stream in DualEntry:
 * the bank account settlements are paid from, or the account that tracks the Expensify Card balance.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntrySettlementStreamBankAccount, updateDualEntrySettlementStreamCardAccount} from '@libs/actions/connections/DualEntry';
import {
    getDualEntrySettlementStreamAccountOptions,
    getDualEntrySettlementStreamFeedbackKey,
    getDualEntrySettlementStreamKey,
    isDualEntrySettlementStreamAccountSetting,
    isDualEntrySettlementStreamAvailable,
    isDualEntrySettlementStreamCurrency,
} from '@libs/DualEntryUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DualEntryAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: DualEntryAccount['id'];
};

type DualEntrySettlementStreamAccountPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_SETTLEMENT_STREAM_ACCOUNT>;

function DualEntrySettlementStreamAccountPage({
    policy,
    route: {
        params: {currency, setting},
    },
}: DualEntrySettlementStreamAccountPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    // The currency and the setting come from the URL, so a link with anything else shows the not found page
    const streamCurrency = isDualEntrySettlementStreamCurrency(currency) ? currency : undefined;
    const accountSetting = isDualEntrySettlementStreamAccountSetting(setting) ? setting : undefined;
    const streamKey = streamCurrency ? getDualEntrySettlementStreamKey(streamCurrency) : undefined;
    const isBankAccountSetting = accountSetting === CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID;
    const stream = streamKey ? dualentryConfig?.sync?.settlementStreams?.[streamKey] : undefined;
    const selectedAccountID = isBankAccountSetting ? stream?.bankAccountID : stream?.cardAccountID;

    // A link to a stream the workspace can't set up is blocked the same way the advanced page hides its section
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isStreamAvailable = !!streamCurrency && isDualEntrySettlementStreamAvailable(allCardSettings, stream, streamCurrency);
    const feedbackKey = streamKey && accountSetting ? getDualEntrySettlementStreamFeedbackKey(streamKey, accountSetting) : undefined;

    const data: AccountListItem[] =
        streamCurrency && accountSetting
            ? getDualEntrySettlementStreamAccountOptions(accountSetting, streamCurrency, dualentryConfig, dualentryData).map((account) => ({
                  value: account.id,
                  text: `${account.id} ${account.name}`,
                  keyForList: account.id,
                  isSelected: selectedAccountID === account.id,
              }))
            : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const title = isBankAccountSetting ? 'workspace.dualEntry.settlementStream.bankAccount.label' : 'workspace.dualEntry.settlementStream.cardAccount.label';
    const description = isBankAccountSetting ? 'workspace.dualEntry.settlementStream.bankAccount.description' : 'workspace.dualEntry.settlementStream.cardAccount.description';

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{streamCurrency ? translate(description, streamCurrency) : ''}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.dualEntry.noAccountsFound')}
            subtitle={translate('workspace.dualEntry.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const setStreamAccount = (item: AccountListItem) => {
        if (item.value !== selectedAccountID && policyID && streamKey) {
            if (isBankAccountSetting) {
                updateDualEntrySettlementStreamBankAccount(policyID, streamKey, item.value, selectedAccountID);
            } else {
                updateDualEntrySettlementStreamCardAccount(policyID, streamKey, item.value, selectedAccountID);
            }
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!isStreamAvailable || !accountSetting}
            displayName="DualEntrySettlementStreamAccountPage"
            headerTitleAlreadyTranslated={streamCurrency ? translate(title, streamCurrency) : ''}
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={setStreamAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={feedbackKey ? settingsPendingAction([feedbackKey], dualentryConfig?.pendingFields) : undefined}
            errors={feedbackKey ? getLatestErrorField(dualentryConfig, feedbackKey) : undefined}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && feedbackKey && clearDualEntryErrorField(policyID, feedbackKey)}
        />
    );
}

export default withPolicyConnections(DualEntrySettlementStreamAccountPage);
