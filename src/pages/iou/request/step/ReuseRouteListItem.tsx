import Badge from '@components/Badge';
import ReceiptImage from '@components/ReceiptImage';
import SelectableListItem from '@components/SelectionList/ListItem/SelectableListItem';
import type {ListItem, SelectableListItemProps} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatLastUsed, getRouteEndpoints} from '@libs/ReusableDistanceRoutesUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';

import type {ReusableDistanceRoute} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ReuseRouteListItemData = ListItem & {
    route: ReusableDistanceRoute;
};

type ReuseRouteListItemProps = SelectableListItemProps<ReuseRouteListItemData>;

/**
 * Card for the Reuse prior route list. Shows the map receipt thumbnail of the source expense with a
 * Last used badge, plus the addresses of the first and last waypoint.
 */
function ReuseRouteListItem({item, isFocused, isFocusVisible, showTooltip, isDisabled, onSelectRow, onDismissError, onFocus, shouldSyncFocus}: ReuseRouteListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const {start, end} = getRouteEndpoints(item.route);
    const thumbnailSource = item.route.receiptSource ? tryResolveUrlFromApiRoot(`${item.route.receiptSource}.320.jpg`) : undefined;

    return (
        <SelectableListItem
            item={item}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap4, styles.p4]}>
                <View>
                    <View style={styles.reuseRouteThumbnail}>
                        {!!thumbnailSource && (
                            <ReceiptImage
                                source={thumbnailSource}
                                transactionID={item.route.transactionID}
                                isThumbnail
                                shouldUseThumbnailImage
                                isAuthTokenRequired
                                fallbackIcon={icons.Receipt}
                                fallbackIconSize={20}
                                fallbackIconColor={theme.icon}
                            />
                        )}
                    </View>
                    <Badge
                        text={translate('distance.lastUsed', {date: formatLastUsed(item.route.inserted)})}
                        badgeStyles={styles.reuseRouteLastUsedBadge}
                        isCondensed
                    />
                </View>
                <View style={[styles.flex1, styles.gap1]}>
                    <Text numberOfLines={1}>
                        <Text style={styles.textSupporting}>{translate('distance.waypointDescription.start')}: </Text>
                        {start}
                    </Text>
                    <Text numberOfLines={1}>
                        <Text style={styles.textSupporting}>{translate('distance.end')}: </Text>
                        {end}
                    </Text>
                </View>
            </View>
        </SelectableListItem>
    );
}

export default ReuseRouteListItem;
export type {ReuseRouteListItemData};
