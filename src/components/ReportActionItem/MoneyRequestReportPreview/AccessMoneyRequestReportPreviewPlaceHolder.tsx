import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function AccessMoneyRequestReportPreviewPlaceHolder() {
    const icons = useMemoizedLazyExpensifyIcons(['EyeDisabled']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[styles.alignItemsCenter, styles.highlightBG, styles.ml0, styles.mr0, styles.gap4, styles.reportContainerBorderRadius]}>
            <View style={[styles.emptyStateMoneyRequestPreviewReport, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={[shouldUseNarrowLayout ? styles.w100 : {width: 303}, styles.m1, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap4]}>
                    <ImageSVG
                        fill={theme.border}
                        height={64}
                        width={64}
                        src={icons.EyeDisabled}
                    />
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.fontSizeLabel]}>{translate('search.moneyRequestReport.accessPlaceHolder')}</Text>
                </View>
            </View>
        </View>
    );
}

export default AccessMoneyRequestReportPreviewPlaceHolder;
