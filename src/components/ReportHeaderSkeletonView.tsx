import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useVerticalBarBackButton from '@hooks/useVerticalBarBackButton';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import ReportHeaderTitleSkeleton from './ReportHeaderTitleSkeleton';

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
    // The vertical bar of a foldable iPhone has the back button instead, as it does for the header this one stands in for.
    const isBackButtonInVerticalBar = useVerticalBarBackButton(onBackButtonPress, shouldUseNarrowLayout);
    const hasBackButton = shouldUseNarrowLayout && !isBackButtonInVerticalBar;

    return (
        <View style={[styles.appContentHeader, hasBackButton && styles.pl2, styles.h100]}>
            <View style={[styles.appContentHeaderTitle, !hasBackButton && styles.pl5]}>
                {hasBackButton && (
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
                <ReportHeaderTitleSkeleton shouldAnimate={shouldAnimate} />
            </View>
        </View>
    );
}

export default ReportHeaderSkeletonView;
