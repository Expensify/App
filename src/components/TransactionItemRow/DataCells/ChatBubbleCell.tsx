import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isChatThread} from '@libs/ReportUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

const isReportUnread = ({lastReadTime = '', lastVisibleActionCreated = '', lastMentionedTime = ''}: Report): boolean =>
    lastReadTime < lastVisibleActionCreated || lastReadTime < (lastMentionedTime ?? '');

function ChatBubbleCell({transaction, containerStyles, isInSingleTransactionReport}: {transaction: Transaction; containerStyles?: ViewStyle[]; isInSingleTransactionReport?: boolean}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const nonEmptyStringTransactionReportID = getNonEmptyStringOnyxID(transaction.reportID);

    const getIOUActionForTransactionIDSelector = useCallback(
        (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => {
            return getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID);
        },
        [transaction.transactionID],
    );

    const [iouReportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nonEmptyStringTransactionReportID}`,
        {
            selector: getIOUActionForTransactionIDSelector,
            canBeMissing: true,
        },
        [getIOUActionForTransactionIDSelector],
    );

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportAction?.childReportID}`, {
        canBeMissing: true,
    });

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nonEmptyStringTransactionReportID}`, {
        canBeMissing: false,
    });

    const transactionReport = isInSingleTransactionReport ? parentReport : childReport;

    const threadMessages = useMemo(
        () => ({
            count: (iouReportAction && iouReportAction?.childVisibleActionCount) ?? 0,
            isUnread: isChatThread(transactionReport) && isReportUnread(transactionReport),
        }),
        [iouReportAction, transactionReport],
    );

    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleCounter']);

    const iconSize = shouldUseNarrowLayout ? variables.iconSizeSmall : variables.iconSizeNormal;
    const fontSize = shouldUseNarrowLayout ? variables.fontSizeXXSmall : variables.fontSizeExtraSmall;

    return (
        threadMessages.count > 0 && (
            <View style={[styles.dFlex, styles.alignItemsCenter, styles.justifyContentCenter, styles.textAlignCenter, StyleUtils.getWidthAndHeightStyle(iconSize), containerStyles]}>
                <Icon
                    src={icons.ChatBubbleCounter}
                    additionalStyles={[styles.pAbsolute]}
                    fill={threadMessages.isUnread ? theme.iconMenu : theme.icon}
                    width={iconSize}
                    height={iconSize}
                />
                <Text
                    style={[
                        styles.textBold,
                        StyleUtils.getLineHeightStyle(variables.lineHeightXSmall),
                        StyleUtils.getColorStyle(theme.appBG),
                        StyleUtils.getFontSizeStyle(fontSize),
                        {top: -1},
                    ]}
                >
                    {threadMessages.count > 99 ? '99+' : threadMessages.count}
                </Text>
            </View>
        )
    );
}

export default ChatBubbleCell;
