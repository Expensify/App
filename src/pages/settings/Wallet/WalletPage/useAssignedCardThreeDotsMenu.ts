import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';

import {maskCardNumber} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import {deletePersonalCard} from '@userActions/Card';
import {close as closeModal} from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect, useRef, useState} from 'react';

import type {CardPressHandlerParams} from './types';

import useSelectedPaymentMethodMenuHeader from './useSelectedPaymentMethodMenuHeader';

/**
 * Owns the selection state and actions of the three-dots menu shown on assigned company card rows:
 * view transactions and, for CSV-imported cards, import a spreadsheet or delete the card.
 */
function useAssignedCardThreeDotsMenu(allPolicies: OnyxCollection<Policy>) {
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [savedColumnLayouts] = useOnyx(ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['MoneySearch', 'Table', 'Trashcan']);
    const {showConfirmModal} = useConfirmModal();
    const {paymentMethod, setPaymentMethod} = usePaymentMethodState();
    const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined);
    const menuHeaderItems = useSelectedPaymentMethodMenuHeader(paymentMethod.formattedSelectedPaymentMethod);

    // Deleting a card needs the transaction and report collections, but only at confirm time. Reading them through a
    // ref keeps confirmDeleteCard, and with it the menu items handed to PaymentMethodList, stable while those
    // collections churn, so the cards list does not re-render on every unrelated transaction or report update.
    const deleteCardDataRef = useRef({allTransactions, allReports, savedColumnLayouts});
    useEffect(() => {
        deleteCardDataRef.current = {allTransactions, allReports, savedColumnLayouts};
    }, [allTransactions, allReports, savedColumnLayouts]);

    const onAssignedCardPress = ({cardData, icon, cardID}: CardPressHandlerParams) => {
        setSelectedCard(cardData);
        const isCSVImportCard = cardData?.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD;
        const cardTitle = isCSVImportCard ? (cardData?.nameValuePairs?.cardTitle ?? cardData?.cardName) : maskCardNumber(cardData?.cardName, cardData?.bank);
        setPaymentMethod({
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: cardTitle ?? '',
                description: cardData ? getDescriptionForPolicyDomainCard(cardData.domainName, allPolicies) : '',
                icon,
            },
            selectedPaymentMethodType: '',
            methodID: cardID ?? CONST.DEFAULT_NUMBER_ID,
        });
    };

    /**
     * Show confirmation modal for deleting a personal card and delete it if confirmed
     */
    const confirmDeleteCard = async () => {
        if (!selectedCard?.cardID) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('walletPage.deleteCard'),
            prompt: translate('walletPage.deleteCardConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });

        if (result.action === ModalActions.CONFIRM) {
            const deleteCardData = deleteCardDataRef.current;
            deletePersonalCard({
                cardID: selectedCard.cardID,
                card: selectedCard,
                allTransactions: deleteCardData.allTransactions,
                allReports: deleteCardData.allReports,
                savedColumnLayout: deleteCardData.savedColumnLayouts?.[selectedCard.cardID],
            });
        }
        setSelectedCard(undefined);
    };

    const shouldShowCSVImportItems = selectedCard?.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD;
    const cardThreeDotsMenuItems: PopoverMenuItem[] = [
        ...menuHeaderItems,
        {
            text: translate('workspace.common.viewTransactions'),
            icon: icons.MoneySearch,
            onSelected: () => {
                closeModal(() => {
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query: buildCannedSearchQuery({
                                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                                cardID: String(paymentMethod.methodID),
                            }),
                        }),
                    );
                });
            },
        },
        ...(shouldShowCSVImportItems
            ? [
                  {
                      text: translate('spreadsheet.importSpreadsheet'),
                      icon: icons.Table,
                      onSelected: () => {
                          closeModal(() => {
                              Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_SPREADSHEET.getRoute(Number(paymentMethod.methodID)));
                          });
                      },
                  },
                  {
                      text: translate('common.delete'),
                      icon: icons.Trashcan,
                      onSelected: () => {
                          closeModal(() => {
                              confirmDeleteCard();
                          });
                      },
                  },
              ]
            : []),
    ];

    return {cardThreeDotsMenuItems, onAssignedCardPress};
}

export default useAssignedCardThreeDotsMenu;
