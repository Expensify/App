import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ExpenseListItem from '@components/SelectionList/ExpenseListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
// import EmptySearchView from './EmptySearchView';
// import SearchResults from './SearchResults';
import useCustomBackHandler from './useCustomBackHandler';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    useCustomBackHandler();

    const getListHeader = () => {
        // const showMerchantColumn = ReportUtils.shouldShowMerchantColumn(data);
        const showMerchantColumn = isSmallScreenWidth && true;

        return (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3]}>
                {/* <Text style={styles.searchInputStyle}>{translate('common.receipt')}</Text> */}
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.date')}</Text>
                {showMerchantColumn && <Text style={[styles.searchInputStyle]}>{translate('common.merchant')}</Text>}
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.description')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.from')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.to')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.category')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.tag')}</Text>
                <Text style={[styles.searchInputStyle, styles.flex1, styles.textAlignRight]}>{translate('common.total')}</Text>
            </View>
        );
    };

    return (
        <ScreenWrapper testID={SearchPage.displayName}>
            <HeaderWithBackButton
                title="All"
                icon={Illustrations.MoneyReceipts}
                shouldShowBackButton={false}
            />
            <SelectionList
                canSelectMultiple
                customListHeader={getListHeader()}
                ListItem={ExpenseListItem}
                onSelectRow={() => {}}
                onSelectAll={() => {}}
                sections={[{data: [], isDisabled: false}]}
                onCheckboxPress={() => {}}
                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
            />
            {/* <SearchResults query={route.params.query} />
            <EmptySearchView /> */}
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
