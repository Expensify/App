import {useTableContext} from '@components/Table/TableContext';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {RoomMemberRowData} from '.';

type RoomMembersTableBodyProps = ViewProps & {
    /** Optional custom styles for the FlashList content container. */
    contentContainerStyle?: StyleProp<ViewStyle>;
};

function RoomMembersTableBody({contentContainerStyle, style, ...props}: RoomMembersTableBodyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        processedData: filteredAndSortedData,
        activeSearchString,
        listProps,
        listRef,
        shouldUseNarrowTableLayout,
        hasActiveFilters,
        hasSearchString,
        isEmptyResult,
    } = useTableContext<RoomMemberRowData>();
    const {ListEmptyComponent, contentContainerStyle: listContentContainerStyle, ...restListProps} = listProps ?? {};

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: shouldUseNarrowTableLayout ? styles.pb20 : styles.pb4,
    });
    const {minHeight: contentMinHeight} = StyleSheet.flatten(contentContainerStyle) ?? {};
    const {paddingBottom: tableBodyBottomPadding} = StyleSheet.flatten(tableBodyContentContainerStyle) ?? {};

    const getEmptyMessage = () => {
        if (hasSearchString) {
            return `${translate('roomMembersPage.memberNotFound')} ${translate('roomMembersPage.useInviteButton')}`;
        }
        if (hasActiveFilters) {
            return translate('common.noResultsFound');
        }
        return '';
    };

    const message = getEmptyMessage();

    useDebouncedAccessibilityAnnouncement(message, isEmptyResult, activeSearchString);

    const EmptyResultComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text
                style={[styles.textNormal, styles.colorMuted]}
                aria-hidden
            >
                {message}
            </Text>
        </View>
    );

    return (
        <View
            style={[styles.flex1, styles.mnh0, style]}
            {...props}
        >
            <FlashList<RoomMemberRowData>
                ref={listRef}
                data={filteredAndSortedData}
                style={[styles.flex1, styles.mnh0]}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                contentContainerStyle={[
                    filteredAndSortedData.length === 0 && styles.flexGrow1,
                    listContentContainerStyle,
                    tableBodyContentContainerStyle,
                    contentContainerStyle,
                    shouldUseNarrowTableLayout &&
                        typeof contentMinHeight === 'number' &&
                        typeof tableBodyBottomPadding === 'number' && {minHeight: contentMinHeight + tableBodyBottomPadding},
                ]}
                keyboardShouldPersistTaps="handled"
                {...restListProps}
            />
        </View>
    );
}

export default RoomMembersTableBody;
