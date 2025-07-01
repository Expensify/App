import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionMergeNavigatorParamList} from '@libs/Navigation/types';
import {getLinkedTransactionID, getReportAction} from '@libs/ReportActionsUtils';
import {getTransaction} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import DuplicateTransactionsList from '../Duplicates/DuplicateTransactionsList';

function MergeReview() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionMergeNavigatorParamList, typeof SCREENS.TRANSACTION_MERGE.REVIEW>>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`, {canBeMissing: false});
    const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionID = getLinkedTransactionID(reportAction, report?.reportID) ?? undefined;
    const [mergeTransaction] = useOnyx(ONYXKEYS.MERGE_TRANSACTION, {canBeMissing: false});

    // Get transaction IDs from merge transaction onyx data
    const transactionIDs = mergeTransaction?.transactionIDs ?? [];
    const transactions = transactionIDs
        .map((id: string) => getTransaction(id))
        .filter(Boolean)
        .sort((a, b) => new Date(a?.created ?? '').getTime() - new Date(b?.created ?? '').getTime());

    const handleMerge = () => {
        // TODO: Implement merge logic
        Navigation.goBack();
    };

    const handleCancel = () => {
        Navigation.goBack(route.params?.backTo);
    };

    // Need at least 2 transactions to merge
    const canMerge = transactions.length >= 2;

    return (
        <ScreenWrapper testID={MergeReview.displayName}>
            <FullPageNotFoundView shouldShow={!canMerge}>
                <HeaderWithBackButton
                    title={translate('common.merge')}
                    onBackButtonPress={handleCancel}
                />
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.ph5, styles.pb3, styles.borderBottom]}>
                    <Button
                        text={translate('common.cancel')}
                        onPress={handleCancel}
                        style={[styles.flex1, styles.mr2]}
                        medium
                    />
                    <Button
                        text={translate('common.merge')}
                        onPress={handleMerge}
                        style={[styles.flex1, styles.ml2]}
                        success
                        medium
                        isDisabled={!canMerge}
                    />
                </View>
                <DuplicateTransactionsList transactions={transactions} />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MergeReview.displayName = 'MergeReview';
export default MergeReview;
