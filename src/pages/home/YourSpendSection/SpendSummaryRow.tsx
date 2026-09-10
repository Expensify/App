import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import {BAR_HEIGHT} from '@components/Skeletons/SkeletonTextLine';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {ICON_SLOT_SIZE, useWidgetSkeletonRowGeometry, WidgetSkeletonRowIcon} from '@pages/home/common/widgetSkeletonRow';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {useYourSpendData} from './useYourSpendData';

import {YOUR_SPEND_ROW_STATE} from './const';

// The skeleton reads its geometry from the same helper the other home widget skeletons use, so a change to
// the real row layout moves all of them together. The trailing button rect those rows draw is left out here
// because Your spend rows end in a chevron or limit circle, not a CTA button.

// Cycle the title width across rows so a stack of them reads as a list of
// differently named rows rather than one bar repeated.
function getSkeletonTitleWidth(index: number) {
    switch (index % 3) {
        case 0:
            return 140;
        case 1:
            return 120;
        case 2:
            return 100;
        default:
            return 120;
    }
}

type SpendSummaryRowProps = {
    state: ReturnType<typeof useYourSpendData>['approvalRowState'];
    testIDPrefix: string;
    description: string;
    totals: ReturnType<typeof useYourSpendData>['approvalTotals'];
    iconSrc: IconAsset;
    onPress: () => void;
    wrapperStyle: StyleProp<ViewStyle>;
    /** Position of this row within the Your spend list, used to vary the skeleton title width across stacked rows */
    skeletonRowIndex: number;
    /** Greys the total when a queued offline change may have made it stale. */
    isStale?: boolean;
};

function SpendSummaryRow({state, testIDPrefix, description, totals, iconSrc, onPress, wrapperStyle, skeletonRowIndex, isStale = false}: SpendSummaryRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {convertToDisplayString} = useCurrencyListActions();
    const {iconTextGap, rowHeight, horizontalPadding} = useWidgetSkeletonRowGeometry();

    if (state === YOUR_SPEND_ROW_STATE.LOADING) {
        const titleX = horizontalPadding + ICON_SLOT_SIZE + iconTextGap;
        const titleWidth = getSkeletonTitleWidth(skeletonRowIndex);
        return (
            <View testID={`${testIDPrefix}-skeleton`}>
                <ItemListSkeletonView
                    fixedNumItems={1}
                    itemViewHeight={rowHeight}
                    shouldAnimate
                    renderSkeletonItem={() => (
                        <>
                            <WidgetSkeletonRowIcon
                                horizontalPadding={horizontalPadding}
                                rowHeight={rowHeight}
                            />
                            <SkeletonRect
                                transform={[{translateX: titleX}, {translateY: (rowHeight - BAR_HEIGHT) / 2}]}
                                width={titleWidth}
                                height={BAR_HEIGHT}
                            />
                        </>
                    )}
                />
            </View>
        );
    }

    if (state !== YOUR_SPEND_ROW_STATE.READY) {
        return null;
    }

    return (
        <View testID={`${testIDPrefix}-row`}>
            <MenuItemWithTopDescription
                description={description}
                title={totals.total !== undefined ? convertToDisplayString(totals.total, totals.currency) : undefined}
                titleStyle={[styles.textBold, isStale && styles.offlineFeedbackPending]}
                onPress={onPress}
                shouldShowRightIcon
                leftComponent={
                    <View style={styles.widgetItemIconContainer}>
                        <Icon
                            src={iconSrc}
                            fill={theme.icon}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                }
                wrapperStyle={wrapperStyle}
                shouldCheckActionAllowedOnPress={false}
            />
        </View>
    );
}

export default SpendSummaryRow;
