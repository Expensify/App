/**
 * The Digits bank account picker that the bill payment and settlement account pages share. It lists every Digits bank
 * account, inactive ones included, and marks the account the sync uses: the saved one, or the default while none is saved.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField} from '@libs/actions/connections/Digits';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount, DigitsSync} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import {getDigitsBankAccount, getDigitsBankAccounts} from './DigitsAdvancedAccountUtils';

type DigitsBankAccountSettingName = keyof Pick<DigitsSync, 'billPaymentAccountID' | 'settlementsBankAccountID' | 'travelInvoicingSettlementsBankAccountID'>;

type DigitsBankAccountSelectPageProps = {
    policy: OnyxEntry<Policy>;

    /** The sync setting the page saves, which also scopes its pending state and errors */
    settingName: DigitsBankAccountSettingName;

    title: TranslationPaths;
    description: TranslationPaths;
    displayName: string;

    /** Whether the page is unavailable, because the sync it belongs to is off or the workspace doesn't have its feature */
    shouldBeBlocked: boolean;

    /** Saves the picked account, given the saved one so the update can roll back */
    onSelectAccount: (policyID: string, accountID: string, savedAccountID: string | undefined) => void;
};

type AccountListItem = ListItem & {
    value: DigitsAccount['id'];
};

function DigitsBankAccountSelectPage({policy, settingName, title, description, displayName, shouldBeBlocked, onSelectAccount}: DigitsBankAccountSelectPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const savedAccountID = digitsConfig?.sync?.[settingName];
    const selectedAccountID = getDigitsBankAccount(policy, savedAccountID)?.id;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DIGITS_ADVANCED.getRoute(policyID) : undefined;

    const data: AccountListItem[] = getDigitsBankAccounts(policy).map((accountItem) => ({
        value: accountItem.id,
        text: accountItem.name,
        keyForList: accountItem.id,
        isSelected: selectedAccountID === accountItem.id,
    }));
    const {filteredData, textInputOptions} = useSelectionListSearch(data, translate('common.noResultsFound'));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate(description)}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.digits.noAccountsFound')}
            subtitle={translate('workspace.digits.noBankAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectAccount = (item: AccountListItem) => {
        // Compare with the saved account, not the default shown, so picking the default saves it and a later change to the default doesn't move the admin's choice
        if (item.value !== savedAccountID && policyID) {
            onSelectAccount(policyID, item.value, savedAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName={displayName}
            title={title}
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            pendingAction={settingsPendingAction([settingName], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, settingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDigitsErrorField(policyID, settingName)}
        />
    );
}

export default DigitsBankAccountSelectPage;
