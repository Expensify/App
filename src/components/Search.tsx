import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as SearchUtils from '@libs/SearchUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';
import Text from './Text';

const mockData = [
    {
        receipt: {source: 'http...'},
        hasEReceipt: false,
        created: '2024-04-11 00:00:00',
        amount: 12500,
        type: 'cash',
        reportID: '1',
        transactionThreadReportID: '2',
        transactionID: '1234',
        modifiedCreated: '2024-05-06 00:00:00',
        description: 'description description description description',
        accountID: '8392101',
        managerID: '8392101',
        currency: 'USD',
        modifiedCurrency: '',
        category: 'Bananas',
        tag: 'Green',
    },
    {
        receipt: {source: 'http...'},
        hasEReceipt: false,
        created: '2024-04-11 00:00:00',
        amount: 12500,
        type: 'card', // not present in live data (data outside of snapshot_)
        reportID: '1',
        transactionThreadReportID: '2',
        transactionID: '5555',
        modifiedCreated: '2024-05-06 00:00:00',
        description: 'description',
        accountID: '8392101',
        managerID: '8392101',
        currency: 'USD',
        modifiedCurrency: '',
        category: 'Bananas',
        tag: 'Green',
    },
];

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    // const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        SearchActions.search(query);
    }, [query]);

    const isLoading = !isOffline && isLoadingOnyxValue(searchResultsMeta);
    // Todo remove using mock data once api is done
    const shouldShowEmptyState = !isEmptyObject(searchResults) || !mockData;

    if (isLoading) {
        return <TableListItemSkeleton shouldAnimate />;
    }

    if (shouldShowEmptyState) {
        return <EmptySearchView />;
    }

    const getListHeader = () => {
        if (isSmallScreenWidth) {
            return;
        }

        // const showMerchantColumn = ReportUtils.shouldShowMerchantColumn(data);
        const showMerchantColumn = isSmallScreenWidth && true;

        return (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.gap3]}>
                {/* <Text style={styles.searchInputStyle}>{translate('common.receipt')}</Text> */}
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.date')}</Text>
                {showMerchantColumn && <Text style={[styles.searchInputStyle]}>{translate('common.merchant')}</Text>}
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.description')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.from')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.to')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.category')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.tag')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1, styles.textAlignRight]}>{translate('common.total')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.type')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.action')}</Text>
            </View>
        );
    };

    const ListItem = SearchUtils.getListItem();

    return (
        <SelectionList
            canSelectMultiple
            customListHeader={getListHeader()}
            ListItem={ListItem}
            sections={[{data: mockData, isDisabled: false}]}
            onSelectRow={() => {}}
            onSelectAll={!isSmallScreenWidth ? () => {} : undefined}
            onCheckboxPress={() => {}}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
