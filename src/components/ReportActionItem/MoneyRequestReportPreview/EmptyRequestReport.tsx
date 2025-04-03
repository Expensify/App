import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import Animated from 'react-native-reanimated';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {submitReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function EmptyRequestReport() {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [currentWidth, setCurrentWidth] = useState(256);

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, currentWidth, true);
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
                                    </Text>
                                    {/* {!doesReportNameOverflow && <>&nbsp;{approvedOrSettledicon}</>} */}
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
