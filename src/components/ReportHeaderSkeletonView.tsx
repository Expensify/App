import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type ReportHeaderSkeletonViewProps = {
    shouldAnimate?: boolean;
};

function ReportHeaderSkeletonView({shouldAnimate = true}: ReportHeaderSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <View style={[styles.appContentHeader]}>
            <View style={[styles.appContentHeaderTitle, !isSmallScreenWidth && styles.pl5]}>
                {isSmallScreenWidth && (
                    <PressableWithFeedback
                        onPress={() => {}}
                        style={[styles.LHNToggle]}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('common.back')}
                    >
                        <Icon src={Expensicons.BackArrow} />
                    </PressableWithFeedback>
                )}
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    width={styles.w100.width}
                    height={variables.contentHeaderHeight}
                    backgroundColor={theme.highlightBG}
                    foregroundColor={theme.border}
                >
                    <Circle
                        cx="20"
                        cy="33"
                        r="20"
                    />
                    <Rect
                        x="55"
                        y="20"
                        width="30%"
                        height="8"
                    />
                    <Rect
                        x="55"
                        y="40"
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
