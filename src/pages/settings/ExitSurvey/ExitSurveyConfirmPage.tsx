import React from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

function ExitSurveyConfirmPage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={ExitSurveyConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
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
