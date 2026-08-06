import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import LongTermsForm from '@pages/EnablePayments/shared/TermsForms/LongTermsForm';
import ShortTermsForm from '@pages/EnablePayments/shared/TermsForms/ShortTermsForm';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

function FeesStep({onNext}: SubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    return (
        <ScrollView style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('termsStep.reviewTheFees')}</Text>
            <View style={[styles.ph5]}>
                <ShortTermsForm userWallet={userWallet} />
                <LongTermsForm />
                <Button
                    success
                    large
                    style={[styles.w100, styles.mv5]}
                    onPress={onNext}
                    text={translate('common.next')}
                />
            </View>
        </ScrollView>
    );
}

export default FeesStep;
