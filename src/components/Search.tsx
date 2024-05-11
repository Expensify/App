import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/Search/SearchTableHeader';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query);
    // const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    const searchResults = {
        "data": {
            "personalDetailsList": {
                "645": {
                    "accountID": 645,
                    "avatar": "https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_22.png",
                    "displayName": "ccc@cc.com",
                    "firstName": "",
                    "lastName": "",
                    "login": "ccc@cc.com",
                    "payPalMeAddress": "",
                    "phoneNumber": "",
                    "pronouns": "",
                    "timezone": {
                        "automatic": true,
                        "selected": "America/Los_Angeles"
                    },
                    "validated": ""
                },
                "844": {
                    "accountID": 844,
                    "avatar": "https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_5.png",
                    "displayName": "long ass name to test text overflowing container dfdf",
                    "firstName": "long ass name to test text overflowing container",
                    "lastName": "dfdf",
                    "login": "cc2@cc.com",
                    "payPalMeAddress": "",
                    "phoneNumber": "",
                    "pronouns": "__predefined_thonThons",
                    "timezone": {
                        "automatic": true,
                        "selected": "America/Los_Angeles"
                    },
                    "validated": ""
                },
            },
            "report_5544039625114797": {
                "reportID": 5544039625114797,
                "reportName": "Dummy report",
                "total": 2234,
                "currency": "USD",
                "action": "view",
            },
            "transactions_1068903897709851923": {
                "accountID": 844,
                "action": "view",
                "amount": -30885,
                "canDelete": false,
                "category": "Uncategorized",
                "comment": {
                    "comment": ""
                },
                "created": "2023-10-28",
                "currency": "USD",
                "hasEReceipt": false,
                "managerID": 645,
                "merchant": "NEWHAIR",
                "modifiedAmount": 0,
                "modifiedCreated": "",
                "modifiedCurrency": "",
                "modifiedMerchant": "",
                "parentTransactionID": "",
                "policyID": "296A4D9E7F12B910",
                "reportID": "5544039625114797",
                "reportType": "expense",
                "tag": "",
                "transactionID": "1068903897709851923",
                "transactionThreadReportID": "0",
                "type": "card"
            },
            "transactions_1145103166671192292": {
                "accountID": 844,
                "action": "view",
                "amount": 0,
                "canDelete": true,
                "category": "Ttt",
                "comment": {
                    "comment": ""
                },
                "created": "2024-05-09 20:43:28",
                "currency": "CAD",
                "hasEReceipt": false,
                "managerID": 645,
                "merchant": "(none)",
                "modifiedAmount": -3300,
                "modifiedCreated": "",
                "modifiedCurrency": "CAD",
                "modifiedMerchant": "test",
                "parentTransactionID": "",
                "policyID": "3CC70F43B8D5D63C",
                "receipt": {
                    "source": "https://www.expensify.com.dev/receipts/w_db31f7b4f64a0285ba742b3eef356001ba39e076.png"
                },
                "reportID": "5544039625114797",
                "reportType": "expense",
                "tag": "",
                "taxAmount": 0,
                "transactionID": "1145103166671192292",
                "transactionThreadReportID": "3314198419415278",
                "type": "cash"
            },
        },
        "search": {
            "hasMoreResults": true,
            "offset": 0,
            "type": "report"
        }
    }

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(query);
    }, [query, isOffline]);

    // const isLoading = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || searchResults?.data === undefined;
    // const shouldShowEmptyState = !isLoading && isEmptyObject(searchResults?.data);

    // if (isLoading) {
    //     return <TableListItemSkeleton shouldAnimate />;
    // }

    // if (shouldShowEmptyState) {
    //     return <EmptySearchView />;
    // }

    const openReport = (reportID?: string) => {
        if (!reportID) {
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, reportID));
    };

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);
    const data = SearchUtils.getSections(searchResults?.data ?? {}, type);
    const shouldShowMerchant = SearchUtils.getShouldShowMerchant(searchResults?.data ?? {});

    return (
        <SelectionList
            customListHeader={<SearchTableHeader shouldShowMerchant={shouldShowMerchant} />}
            ListItem={ListItem}
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                openReport(item.transactionThreadReportID);
            }}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
            containerStyle={[styles.pv0]}
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
