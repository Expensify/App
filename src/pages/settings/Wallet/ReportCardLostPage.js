import React from 'react';
import {Text} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import styles from '../../../styles/styles';

function ReportCardLostPage() {
    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title="Report card lost or damaged"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <Text
                style={[styles.textHeadline, styles.pre]}
                numberOfLines={1}
            >
                Why do you need a new card?
            </Text>
        </ScreenWrapper>
    );
}

export default ReportCardLostPage;
