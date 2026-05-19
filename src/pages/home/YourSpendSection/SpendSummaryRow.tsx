import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import YOUR_SPEND_ROW_STATE from './const';
import type {useYourSpendData} from './useYourSpendData';

const SKELETON_ROW_HEIGHT = 56;
const SKELETON_DESCRIPTION_WIDTH = '50%';
const SKELETON_NARROW_OFFSET_X = 20;
const SKELETON_WIDE_OFFSET_X = 32;
const SKELETON_OFFSET_Y = 20;
const SKELETON_TEXT_HEIGHT = 12;

type SpendSummaryRowProps = {
    state: ReturnType<typeof useYourSpendData>['approvalRowState'];
    testIDPrefix: string;
    description: string;
    totals: ReturnType<typeof useYourSpendData>['approvalTotals'];
    iconSrc: IconAsset;
    onPress: () => void;
    wrapperStyle: StyleProp<ViewStyle>;
};

function SpendSummaryRow({state, testIDPrefix, description, totals, iconSrc, onPress, wrapperStyle}: SpendSummaryRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (state === YOUR_SPEND_ROW_STATE.LOADING) {
        return (
            <View testID={`${testIDPrefix}-skeleton`}>
                <ItemListSkeletonView
                    fixedNumItems={1}
                    itemViewHeight={SKELETON_ROW_HEIGHT}
                    shouldAnimate
                    renderSkeletonItem={() => (
                        <SkeletonRect
                            transform={[{translateX: shouldUseNarrowLayout ? SKELETON_NARROW_OFFSET_X : SKELETON_WIDE_OFFSET_X}, {translateY: SKELETON_OFFSET_Y}]}
                            width={SKELETON_DESCRIPTION_WIDTH}
                            height={SKELETON_TEXT_HEIGHT}
                        />
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
                titleStyle={styles.textBold}
                onPress={onPress}
                shouldShowRightIcon
                leftComponent={
                    <View style={styles.getWidgetItemIconContainerStyle(theme.border)}>
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

SpendSummaryRow.displayName = 'SpendSummaryRow';

export default SpendSummaryRow;
