import React from 'react';
import {useOnyx} from 'react-native-onyx';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import LongTermsForm from '@pages/EnablePayments/TermsPage/LongTermsForm';
import ShortTermsForm from '@pages/EnablePayments/TermsPage/ShortTermsForm';
import ONYXKEYS from '@src/ONYXKEYS';

function FeesStep() {
    const styles = useThemeStyles();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.ph5}
        >
            <ShortTermsForm userWallet={userWallet} />
            <LongTermsForm />
        </ScrollView>
    );
}

export default FeesStep;
