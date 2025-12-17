import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

type TableBodyProps = ViewProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
};

function TableBody<T>({contentContainerStyle, ...props}: TableBodyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {processedData: filteredAndSortedData, originalDataLength, activeSearchString, listProps} = useTableContext<T>();
    const {ListEmptyComponent, contentContainerStyle: listContentContainerStyle} = listProps ?? {};

    // Show "no results found" when search returns empty but original data exists
    const isEmptySearchResult = filteredAndSortedData.length === 0 && activeSearchString.trim().length > 0 && originalDataLength > 0;

    const EmptySearchComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', activeSearchString)}</Text>
        </View>
    );

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...props}>
            <FlashList<T>
                data={filteredAndSortedData}
                ListEmptyComponent={isEmptySearchResult ? EmptySearchComponent : ListEmptyComponent}
                contentContainerStyle={[filteredAndSortedData.length === 0 && styles.flex1, listContentContainerStyle, contentContainerStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...listProps}
            />
        </View>
    );
}

export default TableBody;
