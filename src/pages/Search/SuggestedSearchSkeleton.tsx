import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const SUGGESTED_SEARCH_SKELETON_TEST_ID = 'SuggestedSearchSkeleton';
const NAV_ITEM_HEIGHT = 52;
const SECTION_MENU_ITEM_HORIZONTAL_PADDING = 16;
const SECTION_HEADER_HEIGHT = 32;
const SECTION_HEADER_RECT_HEIGHT = 4;
const ICON_LABEL_GAP = 12;
const ICON_CONTAINER_SIZE = 20;
const LOADING_ICON_SIZE = variables.iconSizeSmall;
const ICON_CONTAINER_VERTICAL_OFFSET = (NAV_ITEM_HEIGHT - ICON_CONTAINER_SIZE) / 2;
const ICON_INNER_OFFSET = (ICON_CONTAINER_SIZE - LOADING_ICON_SIZE) / 2;
const ICON_VERTICAL_OFFSET = ICON_CONTAINER_VERTICAL_OFFSET + ICON_INNER_OFFSET;
const LABEL_VERTICAL_OFFSET = 4;

/** ---- Relative layout tokens ---- */
const LHN = {
    icon: {
        xVal: SECTION_MENU_ITEM_HORIZONTAL_PADDING + ICON_INNER_OFFSET,
        yVal: ICON_VERTICAL_OFFSET,
        w: LOADING_ICON_SIZE,
        h: LOADING_ICON_SIZE,
        r: 4,
    },
    label: {
        xVal: SECTION_MENU_ITEM_HORIZONTAL_PADDING + ICON_CONTAINER_SIZE + ICON_LABEL_GAP,
        yVal: ICON_VERTICAL_OFFSET + LABEL_VERTICAL_OFFSET,
        w: 104,
        h: 8,
    },
    // header bar in the small loader above each group
    header: {
        xVal: 8,
        yVal: (SECTION_HEADER_HEIGHT - SECTION_HEADER_RECT_HEIGHT) / 2,
        w: 36,
        h: SECTION_HEADER_RECT_HEIGHT,
    },
};

function SuggestedSearchSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderNavigationItem = () => {
        const {icon, label} = LHN;

        return (
            <>
                <Rect
                    rx={icon.r}
                    ry={icon.r}
                    width={icon.w}
                    height={icon.h}
                    transform={[{translateX: icon.xVal}, {translateY: icon.yVal}]}
                />
                <Rect
                    width={label.w}
                    height={label.h}
                    transform={[{translateX: label.xVal}, {translateY: label.yVal}]}
                />
            </>
        );
    };

    const shouldRenderNavigationColumn = !shouldUseNarrowLayout;

    const navigationColumnGroup = (
        <>
            <SkeletonViewContentLoader
                animate
                height={SECTION_HEADER_HEIGHT}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            >
                <Rect
                    width={LHN.header.w}
                    height={LHN.header.h}
                    transform={[{translateX: LHN.header.xVal}, {translateY: LHN.header.yVal}]}
                />
            </SkeletonViewContentLoader>

            <ItemListSkeletonView
                fixedNumItems={3}
                itemViewHeight={NAV_ITEM_HEIGHT}
                style={[styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                renderSkeletonItem={renderNavigationItem}
            />
        </>
    );

    const navigationColumn = shouldRenderNavigationColumn ? (
        <View>
            <View>
                {[0, 1, 2].map((i) => (
                    <View
                        key={i}
                        style={[styles.mb4]}
                    >
                        {navigationColumnGroup}
                    </View>
                ))}
            </View>
        </View>
    ) : null;

    return (
        <View
            testID={SUGGESTED_SEARCH_SKELETON_TEST_ID}
            style={[styles.flex1, styles.flexRow, styles.gap4]}
        >
            {navigationColumn}
        </View>
    );
}

export default SuggestedSearchSkeleton;
