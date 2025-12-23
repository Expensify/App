import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type Response from '@src/types/onyx/Response';
import LockAccountPageBase from './LockAccountPageBase';

function LockAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleLockRequestFinish = (response: void | Response) => {
        if (response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
            Navigation.navigate(ROUTES.SETTINGS_UNLOCK_ACCOUNT);
        } else {
            Navigation.navigate(ROUTES.SETTINGS_FAILED_TO_LOCK_ACCOUNT);
        }
    };
    const confirmModalPrompt = (
        <>
            <Text style={styles.mb5}>{translate('lockAccountPage.areYouSure')}</Text>
            <Text style={styles.mb5}>{translate('lockAccountPage.onceLocked')}</Text>
        </>
    );

    const lockAccountPagePrompt = (
        <>
            <Text>{translate('lockAccountPage.compromisedDescription')}</Text>
            <Text>{translate('lockAccountPage.domainAdminsDescription')}</Text>
        </>
    );

    return (
        <LockAccountPageBase
            testID="LockAccountPage"
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_LOCK_ACCOUNT)}
            confirmModalPrompt={confirmModalPrompt}
            lockAccountPagePrompt={lockAccountPagePrompt}
            handleLockRequestFinish={handleLockRequestFinish}
        />
    );
}

export default LockAccountPage;
