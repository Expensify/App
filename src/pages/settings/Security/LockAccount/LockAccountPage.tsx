import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {LockAccountOnyxKey} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type Response from '@src/types/onyx/Response';

import React from 'react';
import {View} from 'react-native';

import LockAccountPageBase from './LockAccountPageBase';

function LockAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleLockRequestFinish = (response: void | Response<LockAccountOnyxKey>) => {
        if (!response?.jsonCode) {
            return;
        }
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
        <View style={[styles.renderHTML, styles.gap4]}>
            <View>
                <RenderHTML html={translate('lockAccountPage.findYourSituation')} />
            </View>
            <View>
                <RenderHTML html={translate('lockAccountPage.lostCardOrCharges')} />
            </View>
            <View>
                <RenderHTML html={translate('lockAccountPage.unauthorizedAccess')} />
            </View>
            <View>
                <RenderHTML html={translate('lockAccountPage.securityTeamFollowUp')} />
            </View>
        </View>
    );

    return (
        <LockAccountPageBase
            testID="LockAccountPage"
            onBackButtonPress={() => Navigation.goBack()}
            confirmModalPrompt={confirmModalPrompt}
            lockAccountPagePrompt={lockAccountPagePrompt}
            lockButtonText={translate('lockAccountPage.lockMyAccount')}
            handleLockRequestFinish={handleLockRequestFinish}
        />
    );
}

export default LockAccountPage;
