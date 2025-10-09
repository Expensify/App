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

/** ---- Relative layout tokens ---- */
const NAV = {
    icon: {x: 18, y: 18, w: 16, h: 16, r: 4},
    // label is positioned relative to icon
    label: {dx: 30, dy: 4, w: 104, h: 8},
    // header bar in the small loader above each group
    header: {x: 8, y: 10, w: 36, h: 4},
};

const RESULT = {
    // left mini box
    box: {x: 10, y: 28, w: 20, h: 20, r: 4},
    // avatar relative to the mini box
    avatar: {dxFromBox: 25, dyFromBox: -9, w: 40, h: 40, r: 20},
    // title/subtitle block
    title: {x: 86, y: 22, wPct: '48%', h: 14, r: 2},
    subtitle: {x: 86, y: 46, wPct: '36%', h: 12, r: 2},
    // right side amounts (keep percent so they anchor to the right)
    amount: {xPct: '78%', y: 26, wPct: '14%', h: 12, r: 2},
    tag: {xPct: '94%', y: 26, w: 16, h: 12, r: 2},
};

type SuggestedSearchSkeletonProps = {
    shouldShowNavigationColumn?: boolean;
    shouldShowResultsColumn?: boolean;
};

function SuggestedSearchSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderNavigationItem = () => {
        const {icon, label} = NAV;
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

    const renderResultItem = () => {
        const {box, avatar, title, subtitle, amount, tag} = RESULT;
        const avatarX = box.x + avatar.dxFromBox;
        const avatarY = box.y + avatar.dyFromBox;

        return (
            <>
                {/* left mini box */}
                <Rect
                    x={box.x}
                    y={box.y}
                    rx={box.r}
                    ry={box.r}
                    width={box.w}
                    height={box.h}
                />
                {/* avatar positioned from mini box */}
                <Rect
                    x={avatarX}
                    y={avatarY}
                    rx={avatar.r}
                    ry={avatar.r}
                    width={avatar.w}
                    height={avatar.h}
                />
                {/* title + sub line */}
                <Rect
                    x={title.x}
                    y={title.y}
                    rx={title.r}
                    ry={title.r}
                    width={title.wPct}
                    height={title.h}
                />
                <Rect
                    x={subtitle.x}
                    y={subtitle.y}
                    rx={subtitle.r}
                    ry={subtitle.r}
                    width={subtitle.wPct}
                    height={subtitle.h}
                />
                {/* right side */}
                <Rect
                    x={amount.xPct}
                    y={amount.y}
                    rx={amount.r}
                    ry={amount.r}
                    width={amount.wPct}
                    height={amount.h}
                />
                <Rect
                    x={tag.xPct}
                    y={tag.y}
                    rx={tag.r}
                    ry={tag.r}
                    width={tag.w}
                    height={tag.h}
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
                    x={NAV.header.x}
                    y={NAV.header.y}
                    width={NAV.header.w}
                    height={NAV.header.h}
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
