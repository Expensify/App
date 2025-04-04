import React, {useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import Folder from '@assets/images/folder.svg';
import Badge from '@components/Badge';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Expensicon from '@components/Icon/Expensicons';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptyRequestReport() {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [currentWidth, setCurrentWidth] = useState(256);

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, currentWidth, true);

    const TransactionContent = (
        <View style={[styles.border, styles.reportContainerBorderRadius]}>
            <View style={[[styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius, styles.moneyRequestPreviewBox]]}>
                <Badge
                    icon={Expensicon.Folder}
                    text=""
                    success
                />
            </View>
        </View>
    );

    return (
        <View style={[reportPreviewStyles.wrapperStyle]}>
            <View style={[reportPreviewStyles.contentContainerStyle]}>
                <View style={[styles.expenseAndReportPreviewTextContainer, styles.overflowHidden]}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                        <View style={[styles.flexRow, styles.mw100, styles.flexShrink1, true && styles.mtn1]}>
                            <Animated.View style={[styles.flexRow, styles.alignItemsCenter, styles.flexShrink1]}>
                                <Text
                                    style={[styles.lh20]}
                                    numberOfLines={3}
                                >
                                    <Text
                                        style={[styles.headerText]}
                                        testID="MoneyRequestReportPreview-reportName"
                                    >
                                        REPORT ACTION NAME
                                        {TransactionContent}
                                    </Text>
                                </Text>
                            </Animated.View>
                        </View>
                    </View>
                </View>
                <View style={[styles.flex1, styles.flexColumn, styles.overflowVisible, styles.mtn1]} />
            </View>
        </View>
    );
    // return <Text>REPORT EMPTY</Text>;
}

export default EmptyRequestReport;
