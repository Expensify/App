import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {ChatSearchStatus, ExpenseSearchStatus, InvoiceSearchStatus, SingleSearchStatus, TripSearchStatus} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getStatusTranslationKey} from '@libs/SearchUIUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

const expenseOptions: Array<{status: ExpenseSearchStatus; icon: IconAsset}> = [
    {
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        icon: Expensicons.All,
    },
    {
        status: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
        icon: Expensicons.Pencil,
    },
    {
        status: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
        icon: Expensicons.Hourglass,
    },
    {
        status: CONST.SEARCH.STATUS.EXPENSE.APPROVED,
        icon: Expensicons.ThumbsUp,
    },
    {
        status: CONST.SEARCH.STATUS.EXPENSE.PAID,
        icon: Expensicons.MoneyBag,
    },
];

const invoiceOptions: Array<{status: InvoiceSearchStatus; icon: IconAsset}> = [
    {
        status: CONST.SEARCH.STATUS.INVOICE.ALL,
        icon: Expensicons.All,
    },
    {
        status: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING,
        icon: Expensicons.Hourglass,
    },
    {
        status: CONST.SEARCH.STATUS.INVOICE.PAID,
        icon: Expensicons.MoneyBag,
    },
];

const tripOptions: Array<{status: TripSearchStatus; icon: IconAsset}> = [
    {
        status: CONST.SEARCH.STATUS.TRIP.ALL,
        icon: Expensicons.All,
    },
    {
        status: CONST.SEARCH.STATUS.TRIP.CURRENT,
        icon: Expensicons.Calendar,
    },
    {
        status: CONST.SEARCH.STATUS.TRIP.PAST,
        icon: Expensicons.History,
    },
];

const chatOptions: Array<{status: ChatSearchStatus; icon: IconAsset}> = [
    {
        status: CONST.SEARCH.STATUS.CHAT.ALL,
        icon: Expensicons.All,
    },
    {
        status: CONST.SEARCH.STATUS.CHAT.UNREAD,
        icon: Expensicons.ChatBubbleUnread,
    },
    {
        status: CONST.SEARCH.STATUS.CHAT.SENT,
        icon: Expensicons.Send,
    },
    {
        status: CONST.SEARCH.STATUS.CHAT.ATTACHMENTS,
        icon: Expensicons.Document,
    },
    {
        status: CONST.SEARCH.STATUS.CHAT.LINKS,
        icon: Expensicons.Paperclip,
    },
    {
        status: CONST.SEARCH.STATUS.CHAT.PINNED,
        icon: Expensicons.Pin,
    },
];

function getOptions(type: string) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return invoiceOptions;
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return tripOptions;
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return chatOptions;
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return expenseOptions;
    }
}

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const currentType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    const statusList = getOptions(currentType);
    const initiallySelectedItems = useMemo(() => {
        if (typeof searchAdvancedFiltersForm?.status === 'string') {
            const statusName = translate(getStatusTranslationKey(searchAdvancedFiltersForm?.status as SingleSearchStatus));
            return [{name: statusName, value: searchAdvancedFiltersForm?.status}];
        }
        return searchAdvancedFiltersForm?.status?.map((status) => {
            const statusName = translate(getStatusTranslationKey(status as SingleSearchStatus));
            return {name: statusName, value: status};
        });
    }, [searchAdvancedFiltersForm?.status, translate]);

    const statusItems = useMemo(() => {
        return statusList.map((statusItem) => {
            const statusName = translate(getStatusTranslationKey(statusItem.status));
            return {name: statusName, value: statusItem.status};
        });
    }, [statusList, translate]);
    const updateStatusFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({status: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.status')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={statusItems}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={updateStatusFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';

export default SearchFiltersStatusPage;
