import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportUtils from '@libs/ReportUtils';
import type {Transaction} from '@src/types/onyx';

type SearchTableHeaderProps = {
    data?: Transaction[];
    onSelectAll?: () => void;
};

function SearchTableHeader({data, onSelectAll}: SearchTableHeaderProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    // const showMerchantColumn = ReportUtils.shouldShowMerchantColumn(data);
    const showMerchantColumn = isSmallScreenWidth && true;

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.receipt')}</Text>
            <Text style={[styles.searchInputStyle]}>{translate('common.date')}</Text>
            {showMerchantColumn && <Text style={[styles.searchInputStyle]}>{translate('common.merchant')}</Text>}
            <Text style={[styles.searchInputStyle]}>{translate('common.description')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.from')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.to')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.category')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter, styles.textAlignRight]}>{translate('common.total')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter, styles.textAlignRight]}>{translate('common.type')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter, styles.textAlignRight]}>{translate('common.action')}</Text>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
