/**
 * Settings of one UK/EU Expensify Card settlement stream on the DualEntry advanced page:
 * the sync switch and the two accounts a settlement is posted between.
 */
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntrySettlementStreamEnabled} from '@libs/actions/connections/DualEntry';
import {getDualEntrySettlementStreamFeedbackKey, getDualEntrySettlementStreamKey, isDualEntrySettlementStreamAvailable} from '@libs/DualEntryUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DualEntrySettlementStreamCurrency} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type DualEntrySettlementStreamSectionProps = {
    policyID: string;

    /** The section renders nothing unless the workspace's UK/EU card program can settle in this currency or the stream is still on */
    currency: DualEntrySettlementStreamCurrency;
};

function DualEntrySettlementStreamSection({policyID, currency}: DualEntrySettlementStreamSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const streamKey = getDualEntrySettlementStreamKey(currency);
    const stream = dualentryConfig?.sync?.settlementStreams?.[streamKey];
    if (!isDualEntrySettlementStreamAvailable(allCardSettings, stream, currency)) {
        return null;
    }

    const isEnabled = stream?.enabled ?? false;
    const accounts = policy?.connections?.dualEntry?.data?.accounts;
    const bankAccount = accounts?.find((account) => account.id === stream?.bankAccountID);
    const cardAccount = accounts?.find((account) => account.id === stream?.cardAccountID);
    const enabledFeedbackKey = getDualEntrySettlementStreamFeedbackKey(streamKey, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.ENABLED);
    const bankAccountFeedbackKey = getDualEntrySettlementStreamFeedbackKey(streamKey, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID);
    const cardAccountFeedbackKey = getDualEntrySettlementStreamFeedbackKey(streamKey, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID);

    // The backend refuses to turn a stream on before both accounts are selected, so the switch stays locked until then
    const isLocked = !isEnabled && (!bankAccount || !cardAccount);

    return (
        <>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.dualEntry.settlementStream.sync', currency)}
                subtitle={isLocked ? translate('workspace.dualEntry.settlementStream.selectAccountsFirst') : translate('workspace.dualEntry.settlementStream.description', currency)}
                switchAccessibilityLabel={translate('workspace.dualEntry.settlementStream.sync', currency)}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DUAL_ENTRY.SETTLEMENT_STREAM_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={isEnabled}
                disabled={isLocked}
                showLockIcon={isLocked}
                onToggle={() => updateDualEntrySettlementStreamEnabled(policyID, streamKey, !isEnabled, isEnabled)}
                pendingAction={settingsPendingAction([enabledFeedbackKey], dualentryConfig?.pendingFields)}
                errors={getLatestErrorField(dualentryConfig ?? {}, enabledFeedbackKey)}
                onCloseError={() => clearDualEntryErrorField(policyID, enabledFeedbackKey)}
            />
            <OfflineWithFeedback pendingAction={settingsPendingAction([bankAccountFeedbackKey], dualentryConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DUAL_ENTRY.SETTLEMENT_STREAM_BANK_ACCOUNT}
                    name={translate('workspace.dualEntry.settlementStream.bankAccount.label', currency)}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.POLICY_ACCOUNTING_DUALENTRY_SETTLEMENT_STREAM_ACCOUNT.getRoute(policyID, currency, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID),
                        )
                    }
                    value={bankAccount ? `${bankAccount.id} ${bankAccount.name}` : undefined}
                >
                    {areSettingsInErrorFields([bankAccountFeedbackKey], dualentryConfig?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([cardAccountFeedbackKey], dualentryConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DUAL_ENTRY.SETTLEMENT_STREAM_CARD_ACCOUNT}
                    name={translate('workspace.dualEntry.settlementStream.cardAccount.label', currency)}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.POLICY_ACCOUNTING_DUALENTRY_SETTLEMENT_STREAM_ACCOUNT.getRoute(policyID, currency, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID),
                        )
                    }
                    value={cardAccount ? `${cardAccount.id} ${cardAccount.name}` : undefined}
                >
                    {areSettingsInErrorFields([cardAccountFeedbackKey], dualentryConfig?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
            </OfflineWithFeedback>
        </>
    );
}

export default DualEntrySettlementStreamSection;
