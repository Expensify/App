import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import LongTermsForm from '@pages/EnablePayments/TermsPage/LongTermsForm';
import ShortTermsForm from '@pages/EnablePayments/TermsPage/ShortTermsForm';
import ONYXKEYS from '@src/ONYXKEYS';

function FeesStep({onNext}: SubStepProps) {
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
