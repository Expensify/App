import {format, parseISO} from 'date-fns';
import React from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearCardErrorField, clearCardNameValuePairsErrorField, setPersonalCardReimbursable} from '@userActions/Card';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, PersonalDetails} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type PersonalCardDetailsHeaderMenuProps = {
    card: Card;
    cardID: string;
    cardholder: PersonalDetails | null | undefined;
    displayName: string;
    customCardNames: Record<string, string> | undefined;
    expensifyIcons: Record<string, IconAsset>;
    isCSVImportedPersonalCard: boolean;
    reimbursableSetting: boolean;
    lastScrape: string;
    isOffline: boolean;
    onUpdateCard: () => void;
    onUnassignCard: () => void;
};

function PersonalCardDetailsHeaderMenu({
    card,
    cardID,
    cardholder,
    displayName,
    customCardNames,
    expensifyIcons,
    isCSVImportedPersonalCard,
    reimbursableSetting,
    lastScrape,
    isOffline,
    onUpdateCard,
    onUnassignCard,
}: PersonalCardDetailsHeaderMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {!cardholder?.validated && (
                <MenuItem
                    icon={Expensicons.Hourglass}
                    iconStyles={styles.mln2}
                    description={translate('workspace.expensifyCard.cardPending', {name: displayName})}
                    numberOfLinesDescription={0}
                    interactive={false}
                />
            )}

            <MenuItem
                label={translate('workspace.moreFeatures.companyCards.cardholder')}
                title={displayName}
                titleStyle={styles.mt1}
                iconStyles={styles.mt1}
                icon={cardholder?.avatar ?? expensifyIcons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={cardholder?.login ?? ''}
                interactive={false}
            />
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
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.companyCards.cardNumber')}
                    title={customCardNames?.[cardID] ?? getDefaultCardName(cardholder?.firstName)}
                    shouldShowRightIcon
                    brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_NAME.getRoute(cardID))}
                />
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

            <MenuItemWithTopDescription
                shouldShowRightComponent={card?.isLoadingLastUpdated}
                rightComponent={<ActivityIndicator style={[styles.popoverMenuIcon]} />}
                description={translate('workspace.moreFeatures.companyCards.lastUpdated')}
                title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : lastScrape}
                interactive={false}
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
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                        title={card?.scrapeMinDate ? format(parseISO(card.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : ''}
                        shouldShowRightIcon
                        brickRoadIndicator={card?.errorFields?.scrapeMinDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE.getRoute(cardID))}
                    />
                </OfflineWithFeedback>
            )}
            <MenuItem
                icon={expensifyIcons.MoneySearch}
                title={translate('workspace.common.viewTransactions')}
                style={styles.mt3}
                onPress={() => {
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
                        }),
                    );
                }}
            />
            {!isCSVImportedPersonalCard && (
                <OfflineWithFeedback
                    pendingAction={card?.pendingFields?.lastScrape}
                    errorRowStyles={[styles.ph5, styles.mb3]}
                    errors={getLatestErrorField(card ?? {}, 'lastScrape')}
                    onClose={() => {
                        if (!card) {
                            return;
                        }
                        clearCardErrorField(card.cardID, 'lastScrape');
                    }}
                >
                    <MenuItem
                        icon={expensifyIcons.Sync}
                        disabled={isOffline || card?.isLoadingLastUpdated}
                        title={translate('workspace.moreFeatures.companyCards.updateCard')}
                        brickRoadIndicator={card?.errorFields?.lastScrape ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        onPress={onUpdateCard}
                    />
                </OfflineWithFeedback>
            )}
            <MenuItem
                icon={expensifyIcons.RemoveMembers}
                title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                style={styles.mb1}
                onPress={onUnassignCard}
            />
        </>
    );
}

PersonalCardDetailsHeaderMenu.displayName = 'PersonalCardDetailsHeaderMenu';

export default PersonalCardDetailsHeaderMenu;
