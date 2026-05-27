import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function WorkspaceCardFeedAddWorkEmailPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const openContactMethods = () => {
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRoute()));
    };

    return (
        <ScreenWrapper
            testID={WorkspaceCardFeedAddWorkEmailPage.displayName}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton title={translate('workspace.companyCards.addWorkEmail')} />
            <View style={[styles.flex1, styles.ph5]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb2]}>{translate('workspace.companyCards.addWorkEmail')}</Text>
                <Text style={[styles.textSupporting]}>{translate('workspace.companyCards.addWorkEmailDescription')}</Text>
            </View>
            <Button
                large
                success
                style={[styles.mh5, styles.mb3]}
                text={translate('workspace.companyCards.openContactMethods')}
                onPress={openContactMethods}
            />
        </ScreenWrapper>
    );
}

WorkspaceCardFeedAddWorkEmailPage.displayName = 'WorkspaceCardFeedAddWorkEmailPage';

export default WorkspaceCardFeedAddWorkEmailPage;
