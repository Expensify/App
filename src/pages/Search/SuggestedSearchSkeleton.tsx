import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

export const SUGGESTED_SEARCH_SKELETON_TEST_ID = 'SuggestedSearchSkeleton';

const NAV_ITEM_HEIGHT = 52;
const RESULT_ITEM_HEIGHT = 80;

type SuggestedSearchSkeletonProps = {
    shouldShowNavigationColumn?: boolean;
    shouldShowResultsColumn?: boolean;
};

function SuggestedSearchSkeleton({shouldShowNavigationColumn = true, shouldShowResultsColumn = true}: SuggestedSearchSkeletonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderNavigationItem = () => (
        <>
            <Rect
                x="18"
                y="18"
                rx="4"
                ry="4"
                width="16"
                height="16"
            />
            <Rect
                x="48"
                y="22"
                width="104"
                height="8"
            />
        </>
    );

    const renderResultItem = () => (
        <>
            <Rect
                x="10"
                y="28"
                rx="4"
                ry="4"
                width="20"
                height="20"
            />
            {/* Left avatar */}
            <Rect
                x="35"
                y="19"
                rx="20"
                ry="20"
                width="40"
                height="40"
            />
            {/* Title + sub line */}
            <Rect
                x="86"
                y="22"
                rx="2"
                ry="2"
                width="48%"
                height="14"
            />
            <Rect
                x="86"
                y="46"
                rx="2"
                ry="2"
                width="36%"
                height="12"
            />

            {/* Right-side amount + trailing short bar; percentages keep these pinned right on all widths */}
            <Rect
                x="78%"
                y="26"
                rx="2"
                ry="2"
                width="14%"
                height="12"
            />
            <Rect
                x="94%"
                y="26"
                rx="2"
                ry="2"
                width="16"
                height="12"
            />
        </>
    );

    const shouldRenderNavigationColumn = shouldShowNavigationColumn && !shouldUseNarrowLayout;
    const shouldRenderResultsColumn = shouldShowResultsColumn;

    const navigationColumnGroup =
        <>
            <SkeletonViewContentLoader
                animate
                height={24}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            >
                <Rect
                    x="8"
                    y="10"
                    rx="0"
                    ry="0"
                    width="36"
                    height="4"
                />
            </SkeletonViewContentLoader>

            <ItemListSkeletonView
                fixedNumItems={3}
                itemViewHeight={NAV_ITEM_HEIGHT}
                style={[styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                renderSkeletonItem={renderNavigationItem}
            />
        </>

    const navigationColumn = shouldRenderNavigationColumn ? (
        <View>
            <View>
                {[0,1,2].map(i => (
                    <View key={i} style={[styles.mb4]}>
                        {navigationColumnGroup}
                    </View>
                ))}
            </View>
        </View>
    ) : null;

    const resultsColumn = shouldRenderResultsColumn ? (
        <View style={[styles.flex1, styles.gap4, styles.mr4]}>
            <ItemListSkeletonView
                itemViewHeight={RESULT_ITEM_HEIGHT}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br2, styles.mh1]}
                renderSkeletonItem={renderResultItem}
            />
        </View>
    ) : null;

    return (
        <View
            testID={SUGGESTED_SEARCH_SKELETON_TEST_ID}
            style={[styles.flex1, styles.flexRow, styles.pb5, styles.pt5, styles.gap4, styles.pl4]}
        >
            {navigationColumn}
            {resultsColumn}
        </View>
    );
}

SuggestedSearchSkeleton.displayName = 'SuggestedSearchSkeleton';

export default SuggestedSearchSkeleton;
