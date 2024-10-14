/* eslint-disable no-console */
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SUBMIT_DETAILS>;

function SubmitDetailsPage({
    route: {
        params: {reportID},
    },
}: ShareDetailsPageProps) {
    // const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [tempShareFiles] = useOnyx(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [personalDetails] = useOnyx(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

    const currentAttachment = useMemo(() => {
        return Object.values(tempShareFiles ?? {})
            .sort((a, b) => Number(b?.processedAt) - Number(a?.processedAt))
            .at(0);
    }, [tempShareFiles]);
    console.log('currentAttachment', currentAttachment);
    const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transaction?.transactionID ?? '-1', report);
    const participants = selectedParticipants.map((participant) => {
        const participantAccountID = participant?.accountID ?? -1;
        return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
    });
    return (
        <ScreenWrapper testID={SubmitDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <MoneyRequestConfirmationList
                        selectedParticipants={participants}
                        iouAmount={0}
                        shouldDisplayReceipt
                        isConfirmed={false}
                        reportID={reportID}
                        shouldShowSmartScanFields={false}
                        receiptPath={currentAttachment?.content ?? 'test'}
                        receiptFilename={FileUtils.getFileName(currentAttachment?.content ?? 'test')}
                        transaction={transaction}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SubmitDetailsPage.displayName = 'SubmitDetailsPage';

export default SubmitDetailsPage;
