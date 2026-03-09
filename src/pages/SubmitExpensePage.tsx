import {useFocusEffect} from '@react-navigation/native';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, start Submit Expense
 *     - Else re-route to the login page
 */
function SubmitExpensePage() {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    useFocusEffect(() => {
        interceptAnonymousUser(() => {
            App.confirmReadyToOpenApp();
            Navigation.isNavigationReady().then(() => {
                if (isUnmounted.current) {
                    return;
                }
                Navigation.goBack();
                IOU.startMoneyRequest(CONST.IOU.TYPE.SUBMIT, ReportUtils.generateReportID(), draftTransactionIDs);
            });
        });
    });

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    return (
        <ScreenWrapper testID="SubmitExpensePage">
            <View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

export default SubmitExpensePage;
