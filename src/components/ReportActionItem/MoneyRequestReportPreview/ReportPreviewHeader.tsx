import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import Icon from '@components/Icon';
import MoneyReportHeaderStatusBarSkeleton from '@components/MoneyReportHeaderStatusBarSkeleton';
import {PressableWithFeedback} from '@components/Pressable';
import StatusBadge from '@components/StatusBadge';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportStatusColorStyle, getReportStatusTranslation} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import {useReportPreviewActions, useReportPreviewCarouselState, useReportPreviewData, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';

/**
 * Renders the top section of the money request report preview: the (animated) report name, the status badge with the
 * expense count, and the carousel navigation arrows. Reads everything from the preview context slices.
 */
function ReportPreviewHeader() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
    const {iouReport, action, transactions} = useReportPreviewData();
    const {previewMessageStyle, shouldShowSkeleton, showStatusAndSkeleton, skeletonReasonAttributes, shouldShowEmptyPlaceholder, shouldShowAccessPlaceHolder, shouldShowCarouselArrows} =
        useReportPreviewUIState();
    const {isPreviousDisabled, isNextDisabled} = useReportPreviewCarouselState();
    const {goToPrevious, goToNext} = useReportPreviewActions();
    const numberOfRequests = transactions.length;

    const reportID = iouReport?.reportID;
    const selectReportName = useCallback((c: OnyxEntry<ReportAttributesDerivedValue>) => (reportID ? c?.reports?.[reportID]?.reportName : undefined), [reportID]);
    const [derivedReportName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: selectReportName});
    const reportName = reportID ? (derivedReportName ?? iouReport?.reportName ?? '') : '';

    /*
     Show subtitle if at least one of the expenses is not being smart scanned, and either:
     - There is more than one expense – in this case, the "X expenses, Y scanning" subtitle is shown;
     - There is only one expense, it has a receipt and is not being smart scanned – in this case, the expense merchant or description is shown;

     * There is an edge case when there is only one distance expense with a pending route and amount = 0.
       In this case, we don't want to show the merchant or description because it says: "Pending route...", which is already displayed in the amount field.
     */
    const expenseCount = useMemo(
        () =>
            translate('iou.expenseCount', {
                count: numberOfRequests,
            }),
        [translate, numberOfRequests],
    );

    const reportStatus = useMemo(
        () =>
            getReportStatusTranslation({
                stateNum: iouReport?.stateNum ?? action?.childStateNum,
                statusNum: iouReport?.statusNum ?? action?.childStatusNum,
                translate,
            }),
        [action?.childStateNum, action?.childStatusNum, iouReport?.stateNum, iouReport?.statusNum, translate],
    );

    const shouldShowReportStatus = !!reportStatus && !!expenseCount;

    const reportStatusColorStyle = useMemo(
        () => getReportStatusColorStyle(theme, iouReport?.stateNum ?? action?.childStateNum, iouReport?.statusNum ?? action?.childStatusNum),
        [action?.childStateNum, action?.childStatusNum, iouReport?.stateNum, iouReport?.statusNum, theme],
    );

    return (
        <View style={[styles.expenseAndReportPreviewTextContainer, styles.overflowHidden]}>
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.flexShrink1, styles.gap1]}>
                <View style={[styles.flexColumn, styles.gap1, styles.flexShrink1]}>
                    <View style={[styles.flexRow, styles.mw100, styles.flexShrink1]}>
                        <Animated.View style={[styles.flexRow, styles.alignItemsCenter, previewMessageStyle, styles.flexShrink1]}>
                            <Text
                                style={[styles.headerText]}
                                testID="MoneyRequestReportPreview-reportName"
                            >
                                {reportName || action.childReportName}
                            </Text>
                        </Animated.View>
                    </View>
                    {showStatusAndSkeleton && shouldShowSkeleton ? (
                        <MoneyReportHeaderStatusBarSkeleton reasonAttributes={skeletonReasonAttributes} />
                    ) : (
                        (!shouldShowEmptyPlaceholder || shouldShowAccessPlaceHolder) &&
                        (shouldShowReportStatus || !shouldShowAccessPlaceHolder) && (
                            <View style={[styles.flexRow, styles.justifyContentStart, styles.alignItemsCenter]}>
                                {shouldShowReportStatus && (
                                    <StatusBadge
                                        text={reportStatus}
                                        backgroundColor={reportStatusColorStyle?.backgroundColor}
                                        textColor={reportStatusColorStyle?.textColor}
                                        badgeStyles={styles.mr1}
                                    />
                                )}
                                {!shouldShowAccessPlaceHolder && <Text style={[styles.textLabelSupporting, styles.lh16]}>{expenseCount}</Text>}
                            </View>
                        )
                    )}
                </View>
                {shouldShowCarouselArrows && (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <PressableWithFeedback
                            accessibilityRole="button"
                            accessible
                            accessibilityLabel={translate('common.previous')}
                            style={[styles.reportPreviewArrowButton, StyleUtils.getBackgroundColorStyle(theme.buttonDefaultBG)]}
                            onPress={goToPrevious}
                            disabled={isPreviousDisabled}
                            disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_PREVIOUS}
                        >
                            <Icon
                                src={expensifyIcons.BackArrow}
                                fill={theme.icon}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            accessibilityRole="button"
                            accessible
                            accessibilityLabel={translate('common.next')}
                            style={[styles.reportPreviewArrowButton, StyleUtils.getBackgroundColorStyle(theme.buttonDefaultBG)]}
                            onPress={goToNext}
                            disabled={isNextDisabled}
                            disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CAROUSEL_NEXT}
                        >
                            <Icon
                                src={expensifyIcons.ArrowRight}
                                fill={theme.icon}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </PressableWithFeedback>
                    </View>
                )}
            </View>
        </View>
    );
}

export default ReportPreviewHeader;
