import Badge from '@components/Badge';
import Icon from '@components/Icon';
import ReceiptImage from '@components/ReceiptImage';
import SelectableListItem from '@components/SelectionList/ListItem/SelectableListItem';
import type {ListItem, SelectableListItemProps} from '@components/SelectionList/ListItem/types';
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

type ReuseRouteListItemProps = SelectableListItemProps<ReuseRouteListItemData>;

/**
 * Card for the "reuse prior route" list. Shows the map receipt of the source expense
 * with a "Last used" badge, plus Start and End rows.
 */
function ReuseRouteListItem({item, isFocused, isFocusVisible, showTooltip, isDisabled, onSelectRow, onDismissError, onFocus, shouldSyncFocus}: ReuseRouteListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt', 'DotIndicatorUnfilled', 'Location']);
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
                    {!!thumbnailSource && (
                        <ReceiptImage
                            source={thumbnailSource}
                            transactionID={item.route.transactionID}
                            shouldUseThumbnailImage
                            isAuthTokenRequired
                            fallbackIcon={icons.Receipt}
                            fallbackIconSize={variables.iconSizeExtraLarge}
                            fallbackIconColor={theme.icon}
                        />
                    )}
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
