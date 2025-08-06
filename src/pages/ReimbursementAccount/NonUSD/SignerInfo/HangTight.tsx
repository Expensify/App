import React, {useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearReimbursementAccountSendReminderForCorpaySignerInformation, sendReminderForCorpaySignerInformation} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';

type HangTightProps = {
    /** ID of policy */
    policyID: string;

    /** ID of bank account */
    bankAccountID: number;
};

function HangTight({policyID, bankAccountID}: HangTightProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const signerEmail = reimbursementAccount?.achData?.corpay?.signerEmail;
    const secondSignerEmail = reimbursementAccount?.achData?.corpay?.secondSignerEmail;

    const handleSendReminder = () => {
        if (!signerEmail) {
            return;
        }

        sendReminderForCorpaySignerInformation({policyID, bankAccountID, signerEmail, secondSignerEmail});
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSendingReminderForCorpaySignerInformation || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess) {
            clearReimbursementAccountSendReminderForCorpaySignerInformation();
        }

        return () => {
            clearReimbursementAccountSendReminderForCorpaySignerInformation();
        };
    }, [reimbursementAccount]);

    return (
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={[styles.flexGrow1, {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={styles.mb5}>
                    <Icon
                        width={144}
                        height={132}
                        src={Illustrations.Pillow}
                    />
                </View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3, styles.mt5]}>{translate('signerInfoStep.hangTight')}</Text>
                <Text style={[styles.mutedTextLabel, styles.mh5]}>{translate('signerInfoStep.weAreWaiting')}</Text>
            </View>
            <View style={[styles.ph5, styles.flexGrow1, styles.justifyContentEnd]}>
                <Button
                    success
                    style={[styles.w100]}
                    onPress={handleSendReminder}
                    large
                    icon={Expensicons.Bell}
                    text={translate('signerInfoStep.sendReminder')}
                />
            </View>
        </ScrollView>
    );
}

HangTight.displayName = 'HangTight';

export default HangTight;
