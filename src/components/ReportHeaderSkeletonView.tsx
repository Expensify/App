import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
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
                            src={Expensicons.BackArrow}
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
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        x="55"
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        y={circleTopY + 8}
                        width="30%"
                        height="8"
                    />
                    <Rect
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        x="55"
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        y={circleBottomY - 12}
                        width="40%"
                        height="8"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

ReportHeaderSkeletonView.displayName = 'ReportHeaderSkeletonView';

export default ReportHeaderSkeletonView;
