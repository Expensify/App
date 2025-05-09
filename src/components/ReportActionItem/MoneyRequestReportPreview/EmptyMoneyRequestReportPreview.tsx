import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptyMoneyRequestReportPreview({emptyReportPreviewAction}: {emptyReportPreviewAction: ReactNode | undefined}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[styles.alignItemsCenter, styles.highlightBG, styles.ml0, styles.mr0, styles.gap4, styles.reportContainerBorderRadius]}>
            <View style={[styles.emptyStateMoneyRequestPreviewReport, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={[styles.m1, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap4]}>
                    <ImageSVG
                        fill={theme.border}
                        height={64}
                        width={64}
                        src={Expensicons.Folder}
                    />
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.fontSizeLabel]}>{translate('search.moneyRequestReport.emptyStateTitle')}</Text>
                </View>
            </View>
            <View style={[{width: shouldUseNarrowLayout ? '100%' : 303, height: 40}]}>{!!emptyReportPreviewAction && emptyReportPreviewAction}</View>
        </View>
    );
}

EmptyMoneyRequestReportPreview.displayName = 'EmptyRequestReport';

export default EmptyMoneyRequestReportPreview;
