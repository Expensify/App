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
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

function Confirm() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const transaction: OnyxEntry<Transaction> = useMemo(() => TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates), [reviewDuplicates]);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`);
    const reportAction = Object.values(reportActions ?? {}).find((action) => action.actionName === 'IOU' && action.originalMessage.IOUTransactionID === reviewDuplicates?.transactionID);
    const transactionsMergeParams = useMemo(() => TransactionUtils.buildTransactionsMergeParams(reviewDuplicates, transaction), [reviewDuplicates, transaction]);
    const mergeDuplicates = useCallback(() => {
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportAction?.childReportID ?? '0'));
    }, [reportAction?.childReportID, transactionsMergeParams]);

    return (
        <ScreenWrapper
            testID={Confirm.displayName}
            shouldShowOfflineIndicator
        >
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
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
                <MoneyRequestView
                    report={report}
                    shouldShowAnimatedBackground={false}
                    nonEditableMode
                    updatedTransaction={transaction}
                />
                <Button
                    text={translate('common.confirm')}
                    success
                    style={styles.ph5}
                    onPress={mergeDuplicates}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

Confirm.displayName = 'Confirm';

export default Confirm;
