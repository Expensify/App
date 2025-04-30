import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {MoneyRequestReportPreviewStyleType} from './types';

function EmptyMoneyRequestReportPreview({reportPreviewStyles, reportId}: {reportPreviewStyles: MoneyRequestReportPreviewStyleType; reportId: string | undefined}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const buttonMaxWidth = !shouldUseNarrowLayout ? {maxWidth: reportPreviewStyles.transactionPreviewStyle.width} : {};

    return (
        <View style={[styles.alignItemsCenter, styles.highlightBG, styles.ml0, styles.mr0, styles.gap4, styles.reportContainerBorderRadius]}>
            <View style={[styles.emptyStateMoneyRequestPreviewReport, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={[styles.m1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ImageSVG
                        fill={theme.border}
                        height={64}
                        width={64}
                        src={Expensicons.Folder}
                    />
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{translate('search.moneyRequestReport.emptyStateTitle')}</Text>
                </View>
            </View>
            <View style={[buttonMaxWidth]}>
                <Button
                    success
                    text={translate('iou.addExpense')}
                    onPress={() => {
                        if (!reportId) {
                            return;
                        }
                        startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportId);
                    }}
                    style={[{width: shouldUseNarrowLayout ? '100%' : 303, height: 40}]}
                />
            </View>
        </View>
    );
}

EmptyMoneyRequestReportPreview.displayName = 'EmptyRequestReport';

export default EmptyMoneyRequestReportPreview;
