import React from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function ExitSurveyResponsePage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={ExitSurveyResponsePage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text>Response page</Text>
            <Button
                text="Next"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM)}
            />
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default ExitSurveyResponsePage;
