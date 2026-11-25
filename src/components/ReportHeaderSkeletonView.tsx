import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import ReportHeaderTitleSkeleton from './ReportHeaderTitleSkeleton';

type ReportHeaderSkeletonViewProps = {
    shouldAnimate?: boolean;
    onBackButtonPress?: () => void;

    /** Whether a narrow layout shows the back button. A header that has one elsewhere, as in the vertical bar of a foldable iPhone, leaves it out. */
    shouldShowBackButton?: boolean;
};

function ReportHeaderSkeletonView({shouldAnimate = true, onBackButtonPress = () => {}, shouldShowBackButton = true}: ReportHeaderSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const hasBackButton = shouldUseNarrowLayout && shouldShowBackButton;

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
