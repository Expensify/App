import Badge from '@components/Badge';
import Icon from '@components/Icon';
import ReceiptImage from '@components/ReceiptImage';
import SelectableListItem from '@components/SelectionList/ListItem/SelectableListItem';
import type {ListItem, ListItemProps} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatLastUsed, getRouteEndpoints, getRouteThumbnailSource} from '@libs/ReusableDistanceRoutesUtils';

import variables from '@styles/variables';

import type {ReusableDistanceRoute} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ReuseRouteListItemData = ListItem & {
    route: ReusableDistanceRoute;
};

function isReuseRouteListItemData(item: ListItem): item is ReuseRouteListItemData {
    return 'route' in item && typeof item.route === 'object' && item.route !== null;
}

type ReuseRouteThumbnailProps = {
    transactionID: string;
    receiptSource?: string;
};

/**
 * Thumbnail for a single reuse-route card. Shows the source expense receipt, which for
 * distance expenses is the stored map image of the route. It is centered and cropped to
 * fill the card area.
 */
function ReuseRouteThumbnail({transactionID, receiptSource}: ReuseRouteThumbnailProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);

    if (!receiptSource) {
        return (
            <View style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Icon
                    src={icons.Receipt}
                    width={variables.iconSizeExtraLarge}
                    height={variables.iconSizeExtraLarge}
                    fill={theme.icon}
                />
            </View>
        );
    }

    return (
        <ReceiptImage
            source={receiptSource}
            transactionID={transactionID}
            shouldUseThumbnailImage
            shouldUseInitialObjectPosition
            isAuthTokenRequired
            fallbackIcon={icons.Receipt}
            fallbackIconSize={variables.iconSizeExtraLarge}
            fallbackIconColor={theme.icon}
        />
    );
}

/**
 * Card for the "reuse prior route" list. Shows the map of the source expense
 * with a "Last used" badge, plus Start and End rows.
 */
function ReuseRouteListItem<TItem extends ListItem>({item, isFocused, isFocusVisible, showTooltip, isDisabled, onSelectRow, onDismissError, onFocus, shouldSyncFocus}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt', 'DotIndicatorUnfilled', 'Location']);

    if (!isReuseRouteListItemData(item)) {
        return null;
    }

    const {start, end} = getRouteEndpoints(item.route);
    const thumbnailSource = getRouteThumbnailSource(item.route.receiptSource);

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
            pressableStyle={styles.reuseRouteCard}
        >
            <View style={styles.reuseRouteThumbnailWrapper}>
                <View style={styles.reuseRouteThumbnail}>
                    <ReuseRouteThumbnail
                        transactionID={item.route.transactionID}
                        receiptSource={thumbnailSource}
                    />
                </View>
            </View>
            <Badge
                text={translate('distance.lastUsed', {date: formatLastUsed(item.route.inserted)})}
                badgeStyles={styles.reuseRouteLastUsedBadge}
                textStyles={styles.reuseRouteLastUsedBadgeText}
            />
            <View style={styles.pv2}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph5, styles.pv3]}>
                    <Icon
                        src={icons.DotIndicatorUnfilled}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                    <View style={[styles.flex1, styles.gap1]}>
                        <Text style={styles.textLabelSupporting}>{translate('distance.waypointDescription.start')}</Text>
                        <Text numberOfLines={1}>{start}</Text>
                    </View>
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph5, styles.pv3]}>
                    <Icon
                        src={icons.Location}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                    <View style={[styles.flex1, styles.gap1]}>
                        <Text style={styles.textLabelSupporting}>{translate('distance.end')}</Text>
                        <Text numberOfLines={1}>{end}</Text>
                    </View>
                </View>
            </View>
        </SelectableListItem>
    );
}

export default ReuseRouteListItem;
export type {ReuseRouteListItemData};
