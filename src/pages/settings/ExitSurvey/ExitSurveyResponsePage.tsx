import React from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function ExitSurveyReasonPage() {
    return (
        <ScreenWrapper testID={ExitSurveyReasonPage.displayName}>
            <HeaderWithBackButton
                title="Before you go"
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text>Response page</Text>
            <Button
                text="Next"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.getRoute(ROUTES.SETTINGS_EXIT_SURVEY_REASON.route))}
            />
        </ScreenWrapper>
    );
}

ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';

export default ExitSurveyReasonPage;
