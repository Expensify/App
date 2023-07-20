import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import useLocalize from '../../../../hooks/useLocalize';

function StatusPage() {
    const localize = useLocalize();

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Status"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
            />

            <Text style={[styles.textHeadline]}>{localize.translate('statusPage.setStatusTitle')}</Text>
            <Text style={[styles.textNormal, styles.mt2]}>{localize.translate('statusPage.statusExplanation')}</Text>

            <View style={[styles.mt5]}>
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
