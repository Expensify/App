import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';

function StatusPage() {
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Status"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
            />

            <Text style={[styles.textHeadline]}>Set your status</Text>
            <Text style={[styles.textLabel]}>Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!</Text>

            <View style={[styles.mt4]}>
                <MenuItemWithTopDescription
                    title=""
                    description="Status"
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
                />
                <MenuItemWithTopDescription
                    title="Today"
                    description="Clear after"
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
                />
            </View>
        </ScreenWrapper>
    );
}

StatusPage.displayName = 'StatusPage';

export default StatusPage;
