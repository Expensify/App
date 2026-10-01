import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import SkeletonRect from './SkeletonRect';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type ReportHeaderSkeletonViewProps = {
    shouldAnimate?: boolean;
    onBackButtonPress?: () => void;
};

function ReportHeaderSkeletonView({shouldAnimate = true, onBackButtonPress = () => {}}: ReportHeaderSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const {contentHeaderHeight} = useContentHeaderHeight();
    // Shorter report header and compose row on mobile web in landscape, where vertical space is scarce.
    const shouldUseCompactChrome = useIsMobileWebLandscape();
    // Matches the header this skeleton stands in for, so the loaded header doesn't change height under it.
    const height = shouldUseCompactChrome ? variables.contentHeaderCompactHeight : contentHeaderHeight;
    const radius = 20;
    const circleY = height / 2;
    const circleTopY = circleY - radius;
    const circleBottomY = circleY + radius;

    return (
        <View style={[styles.appContentHeader, shouldUseCompactChrome && styles.appContentHeaderCompact, shouldUseNarrowLayout && styles.pl2, styles.h100]}>
            <View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && styles.pl5]}>
                {shouldUseNarrowLayout && (
                    <PressableWithFeedback
                        onPress={onBackButtonPress}
                        style={[styles.touchableButtonImage]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.back')}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT_HEADER_SKELETON.GO_BACK}
                    >
                        <Icon
                            fill={theme.icon}
                            src={icons.BackArrow}
                        />
                    </PressableWithFeedback>
                )}
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    width={styles.w100.width}
                    height={height}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                >
                    <Circle
                        cx="20"
                        cy={height / 2}
                        r={radius}
                    />
                    <SkeletonRect
                        transform={[{translateX: 55}, {translateY: circleTopY + 8}]}
                        width="30%"
                        height="8"
                    />
                    <SkeletonRect
                        transform={[{translateX: 55}, {translateY: circleBottomY - 12}]}
                        width="40%"
                        height="8"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

export default ReportHeaderSkeletonView;
