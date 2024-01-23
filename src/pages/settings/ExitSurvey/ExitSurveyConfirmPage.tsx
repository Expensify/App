import React from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Navigation from '@navigation/Navigation';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

function ExitSurveyConfirmPage() {
    return (
        <ScreenWrapper testID={ExitSurveyConfirmPage.displayName}>
            <HeaderWithBackButton
                title="Before you go"
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text>Confirm page</Text>
            <Button
                text="Next"
                onPress={() => {
                    Link.openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
            />
        </ScreenWrapper>
    );
}

ExitSurveyConfirmPage.displayName = 'ExitSurveyConfirmPage';

export default ExitSurveyConfirmPage;
