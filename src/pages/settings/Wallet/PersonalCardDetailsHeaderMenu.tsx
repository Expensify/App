import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDefaultCardName} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';

import Navigation from '@navigation/Navigation';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearCardErrorField, clearCardNameValuePairsErrorField, setPersonalCardReimbursable} from '@userActions/Card';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, PersonalDetails} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import {format, isValid, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

type PersonalCardDetailsHeaderMenuProps = {
    card: Card;
    cardID: string;
    cardholder: PersonalDetails | null | undefined;
    customCardNames: Record<string, string> | undefined;
    expensifyIcons: Record<string, IconAsset>;
    isCSVImportedPersonalCard: boolean;
    reimbursableSetting: boolean;
    isOffline: boolean;
    shouldShowBreakConnection: boolean;
    onBreakConnection: () => void;
    onUnassignCard: () => void;
    onDeleteCard?: () => void;
};

function PersonalCardDetailsHeaderMenu({
    card,
    cardID,
    cardholder,
    customCardNames,
    expensifyIcons,
    isCSVImportedPersonalCard,
    reimbursableSetting,
    isOffline,
    shouldShowBreakConnection,
    onBreakConnection,
    onUnassignCard,
    onDeleteCard,
}: PersonalCardDetailsHeaderMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Table', 'Trashcan']);

    // Guard against an invalid scrapeMinDate, since`format` throws `RangeError: Invalid time value`
    // when `parseISO` can't parse the value
    const parsedScrapeMinDate = card?.scrapeMinDate ? parseISO(card.scrapeMinDate) : undefined;
    const transactionStartDateTitle = parsedScrapeMinDate && isValid(parsedScrapeMinDate) ? format(parsedScrapeMinDate, CONST.DATE.FNS_FORMAT_STRING) : '';

    return (
        <>
            <OfflineWithFeedback
                pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}
                errorRowStyles={[styles.ph5, styles.mb3]}
                errors={getLatestErrorField(card?.nameValuePairs ?? {}, 'cardTitle')}
                onClose={() => {
                    if (!card) {
                        return;
                    }
                    clearCardNameValuePairsErrorField(card.cardID, 'cardTitle');
                }}
            >
                <MenuItemField
                    name={translate('workspace.moreFeatures.companyCards.cardName')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_NAME.getRoute(cardID))}
                    value={
                        customCardNames?.[cardID] ?? (isCSVImportedPersonalCard ? card?.nameValuePairs?.cardTitle : undefined) ?? card?.cardName ?? getDefaultCardName(cardholder?.firstName)
                    }
                >
                    {!!card?.nameValuePairs?.errorFields?.cardTitle && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
            </OfflineWithFeedback>

            <ToggleSettingOptionRow
                title={translate('cardPage.markTransactionsAsReimbursable')}
                subtitle={translate('cardPage.markTransactionsDescription')}
                shouldPlaceSubtitleBelowSwitch
                switchAccessibilityLabel={translate('cardPage.markTransactionsAsReimbursable')}
                isActive={reimbursableSetting}
                onToggle={(isOn) => card && setPersonalCardReimbursable(card.cardID, isOn, reimbursableSetting)}
                pendingAction={card?.pendingFields?.reimbursable}
                errors={card?.errorFields?.reimbursable ?? undefined}
                onCloseError={() => card && clearCardErrorField(card.cardID, 'reimbursable')}
                wrapperStyle={[styles.ph5, styles.mb3]}
            />
            {!isCSVImportedPersonalCard && (
                <OfflineWithFeedback
                    pendingAction={card?.pendingFields?.scrapeMinDate}
                    errorRowStyles={[styles.ph5, styles.mb3]}
                    errors={getLatestErrorField(card ?? {}, 'scrapeMinDate')}
                    onClose={() => {
                        if (!card) {
                            return;
                        }
                        clearCardErrorField(card.cardID, 'scrapeMinDate');
                    }}
                >
                    <MenuItemField
                        name={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE.getRoute(cardID))}
                        value={transactionStartDateTitle}
                    >
                        {!!card?.errorFields?.scrapeMinDate && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    </MenuItemField>
                </OfflineWithFeedback>
            )}
            <View style={styles.mt4}>
                {isCSVImportedPersonalCard && (
                    <MenuItemAction
                        icon={icons.Table}
                        title={translate('spreadsheet.importSpreadsheet')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_SPREADSHEET.getRoute(Number(cardID)))}
                    />
                )}
                {shouldShowBreakConnection && (
                    <MenuItemAction
                        icon={icons.Trashcan}
                        isDisabled={isOffline || card?.isLoadingLastUpdated}
                        title="Break connection (Testing)"
                        onPress={onBreakConnection}
                    />
                )}
                {isCSVImportedPersonalCard ? (
                    <MenuItem
                        icon={icons.Trashcan}
                        title={translate('common.delete')}
                        style={styles.mb1}
                        onPress={onDeleteCard}
                    />
                ) : (
                    <MenuItem
                        icon={expensifyIcons.RemoveMembers}
                        title={translate('workspace.moreFeatures.companyCards.removeCard')}
                        style={styles.mb1}
                        onPress={onUnassignCard}
                    />
                )}
            </View>
        </>
    );
}

PersonalCardDetailsHeaderMenu.displayName = 'PersonalCardDetailsHeaderMenu';

export default PersonalCardDetailsHeaderMenu;
