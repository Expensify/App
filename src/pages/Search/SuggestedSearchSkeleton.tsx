import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

const SUGGESTED_SEARCH_SKELETON_TEST_ID = 'SuggestedSearchSkeleton';
const NAV_ITEM_HEIGHT = 52;

/** ---- Relative layout tokens ---- */
const LHN = {
    icon: {x: 18, y: 18, w: 16, h: 16, r: 4},
    // label is positioned relative to icon
    label: {dx: 30, dy: 4, w: 104, h: 8},
    // header bar in the small loader above each group
    header: {x: 8, y: 10, w: 36, h: 4},
};

function SuggestedSearchSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderNavigationItem = () => {
        const {icon, label} = LHN;
        const labelX = icon.x + label.dx;
        const labelY = icon.y + label.dy;

        return (
            <>
                <Rect
                    x={icon.x}
                    y={icon.y}
                    rx={icon.r}
                    ry={icon.r}
                    width={icon.w}
                    height={icon.h}
                />
                <Rect
                    x={labelX}
                    y={labelY}
                    width={label.w}
                    height={label.h}
                />
            </>
        );
    };

    const shouldRenderNavigationColumn = !shouldUseNarrowLayout;

    const navigationColumnGroup = (
        <>
            <SkeletonViewContentLoader
                animate
                height={24}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            >
                <Rect
                    x={LHN.header.x}
                    y={LHN.header.y}
                    width={LHN.header.w}
                    height={LHN.header.h}
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
            style={[styles.flex1, styles.flexRow, styles.pb5, styles.pt5, styles.gap4, styles.pl4]}
        >
            {navigationColumn}
        </View>
    );
}

SuggestedSearchSkeleton.displayName = 'SuggestedSearchSkeleton';
export default SuggestedSearchSkeleton;
