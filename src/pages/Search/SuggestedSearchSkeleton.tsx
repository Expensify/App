import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

export const SUGGESTED_SEARCH_SKELETON_TEST_ID = 'SuggestedSearchSkeleton';

const NAV_ITEM_HEIGHT = 64;
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
            <Rect x="16" y="16" rx="4" ry="4" width="28" height="28" />
            <Rect x="56" y="20" rx="2" ry="2" width="160" height="12" />
        </>
    );

    const renderResultItem = () => (
        <>
            <Rect x="10" y="28" rx="4" ry="4" width="20" height="20" />
            {/* Left avatar */}
            <Rect x="35" y="19" rx="20" ry="20" width="40" height="40" />
            {/* Title + sub line */}
            <Rect x="86" y="22" rx="2" ry="2" width="48%" height="14" />
            <Rect x="86" y="46" rx="2" ry="2" width="36%" height="12" />

            {/* Right-side amount + trailing short bar; percentages keep these pinned right on all widths */}
            <Rect x="78%" y="26" rx="2" ry="2" width="14%" height="12" />
            <Rect x="94%" y="26" rx="2" ry="2" width="16" height="12" />
        </>
    );

    const shouldRenderNavigationColumn = shouldShowNavigationColumn && !shouldUseNarrowLayout;
    const shouldRenderResultsColumn = shouldShowResultsColumn;

    const navigationColumn = shouldRenderNavigationColumn ? (
        <View>
            {/* LHN header */}
            <SkeletonViewContentLoader
                animate
                height={44}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <Rect x="16" y="16" rx="8" ry="8" width="128" height="12" />
            </SkeletonViewContentLoader>

            <ItemListSkeletonView
                fixedNumItems={6}
                itemViewHeight={NAV_ITEM_HEIGHT}
                itemViewStyle={{
                    borderRadius: variables.componentBorderRadius,
                    backgroundColor: theme.componentBG,
                }}
                renderSkeletonItem={renderNavigationItem}
            />
        </View>
    ) : null;

    const resultsColumn = shouldRenderResultsColumn ? (
        <View style={[styles.flex1, styles.gap4, styles.mr4]}>
            <ItemListSkeletonView
                itemViewHeight={RESULT_ITEM_HEIGHT}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml4, styles.mr4]}
                renderSkeletonItem={renderResultItem}
            />
        </View>
    ) : null;

    if (navigationColumn && resultsColumn) {
        return (
            <View
                testID={SUGGESTED_SEARCH_SKELETON_TEST_ID}
                style={[styles.flex1, styles.flexRow, styles.pb5, styles.pt5, styles.gap4]}
            >
                {navigationColumn}
                {resultsColumn}
            </View>
        );
    }

    if (navigationColumn) {
        return (
            <View testID={SUGGESTED_SEARCH_SKELETON_TEST_ID} style={[styles.pb5, styles.pt5]}>
                {navigationColumn}
            </View>
        );
    }

    if (resultsColumn) {
        return (
            <View
                testID={SUGGESTED_SEARCH_SKELETON_TEST_ID}
                style={[styles.flex1, styles.flexRow, styles.pb5, styles.pt5, styles.gap4]}
            >
                {resultsColumn}
            </View>
        );
    }

    return null;
}

SuggestedSearchSkeleton.displayName = 'SuggestedSearchSkeleton';

export default SuggestedSearchSkeleton;
