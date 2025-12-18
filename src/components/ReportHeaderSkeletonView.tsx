import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
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
    useSkeletonSpan('ReportHeaderSkeletonView');
    const height = styles.headerBarHeight.height;
    const radius = 20;
    const circleY = height / 2;
    const circleTopY = circleY - radius;
    const circleBottomY = circleY + radius;

    return (
        <View style={[styles.appContentHeader, shouldUseNarrowLayout && styles.pl2, styles.h100]}>
            <View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && styles.pl5]}>
                {shouldUseNarrowLayout && (
                    <PressableWithFeedback
                        onPress={onBackButtonPress}
                        style={[styles.touchableButtonImage]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.back')}
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
                    <Rect
                        transform={[{translateX: 55}, {translateY: circleTopY + 8}]}
                        width="30%"
                        height="8"
                    />
                    <Rect
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
