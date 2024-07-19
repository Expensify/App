import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

function Confirmation() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const transaction = useMemo(() => TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates), [reviewDuplicates]);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`);
    const reportAction = Object.values(reportActions ?? {}).find(
        (action) => ReportActionsUtils.isMoneyRequestAction(action) && ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID === reviewDuplicates?.transactionID,
    );

    const transactionsMergeParams = useMemo(() => TransactionUtils.buildTransactionsMergeParams(reviewDuplicates, transaction), [reviewDuplicates, transaction]);
    const mergeDuplicates = useCallback(() => {
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportAction?.childReportID ?? '-1'));
    }, [reportAction?.childReportID, transactionsMergeParams]);

    const contextValue = useMemo(
        () => ({
            transactionThreadReport: report,
            action: reportAction,
            report,
            checkIfContextMenuActive: () => {},
            reportNameValuePairs: undefined,
            anchor: null,
        }),
        [report, reportAction],
    );

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldShowOfflineIndicator
        >
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
            <ScrollView style={styles.mb3}>
                <View style={[styles.ph5, styles.pb8]}>
                    <Text
                        family="EXP_NEW_KANSAS_MEDIUM"
                        fontSize={variables.fontSizeLarge}
                        style={styles.pb5}
                    >
                        {translate('violations.confirmDetails')}
                    </Text>
                    <Text>{translate('violations.confirmDuplicatesInfo')}</Text>
                </View>
                {/* We need that provider here becuase MoneyRequestView component require that */}
                <ShowContextMenuContext.Provider value={contextValue}>
                    <MoneyRequestView
                        report={report}
                        shouldShowAnimatedBackground={false}
                        readonly
                        updatedTransaction={transaction as OnyxEntry<Transaction>}
                    />
                </ShowContextMenuContext.Provider>
                <Button
                    text={translate('common.confirm')}
                    success
                    style={[styles.ph5, styles.mt2]}
                    onPress={mergeDuplicates}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
