import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function Confirmation() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reviewDuplicates, reviewDuplicatesResult] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const transaction = useMemo(() => TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates), [reviewDuplicates]);
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const {goBack} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'confirmation', route.params.threadReportID, route.params.backTo);
    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`);
    const reportAction = Object.values(reportActions ?? {}).find(
        (action) => ReportActionsUtils.isMoneyRequestAction(action) && ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID === reviewDuplicates?.transactionID,
    );

    const transactionsMergeParams = useMemo(() => TransactionUtils.buildTransactionsMergeParams(reviewDuplicates, transaction), [reviewDuplicates, transaction]);
    const isReportOwner = iouReport?.ownerAccountID === currentUserPersonalDetails?.accountID;

    const mergeDuplicates = useCallback(() => {
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportAction?.childReportID ?? '-1'));
    }, [reportAction?.childReportID, transactionsMergeParams]);

    const resolveDuplicates = useCallback(() => {
        IOU.resolveDuplicates(transactionsMergeParams);
        Navigation.dismissModal(reportAction?.childReportID ?? '-1');
    }, [transactionsMergeParams, reportAction?.childReportID]);

    const contextValue = useMemo(
        () => ({
            transactionThreadReport: report,
            action: reportAction,
            report,
            checkIfContextMenuActive: () => {},
            reportNameValuePairs: undefined,
            anchor: null,
            isDisabled: false,
        }),
        [report, reportAction],
    );

    const reportTransactionID = TransactionUtils.getTransactionID(report?.reportID ?? '');
    const doesTransactionBelongToReport = reviewDuplicates?.transactionID === reportTransactionID || reviewDuplicates?.duplicates.includes(reportTransactionID);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(report) ||
        !ReportUtils.isValidReport(report) ||
        ReportUtils.isReportNotFound(report) ||
        (reviewDuplicatesResult.status === 'loaded' && (!transaction?.transactionID || !doesTransactionBelongToReport));

    if (isLoadingOnyxValue(reviewDuplicatesResult, reportResult) || !transaction?.transactionID) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldShowOfflineIndicator
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.reviewDuplicates')}
                            onBackButtonPress={goBack}
                        />
                        <ScrollView>
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
                            {/* We need that provider here becuase MoneyRequestView component requires that */}
                            <ShowContextMenuContext.Provider value={contextValue}>
                                <MoneyRequestView
                                    report={report}
                                    shouldShowAnimatedBackground={false}
                                    readonly
                                    isFromReviewDuplicates
                                    updatedTransaction={transaction as OnyxEntry<Transaction>}
                                />
                            </ShowContextMenuContext.Provider>
                        </ScrollView>
                        <FixedFooter style={styles.mtAuto}>
                            <Button
                                text={translate('common.confirm')}
                                success
                                onPress={() => {
                                    if (!isReportOwner) {
                                        resolveDuplicates();
                                        return;
                                    }
                                    mergeDuplicates();
                                }}
                                large
                            />
                        </FixedFooter>
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
