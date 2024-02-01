import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {MushroomTopHat} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as ExitSurvey from '@userActions/ExitSurvey';
import type {ExitReason} from '@userActions/ExitSurvey';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type ExitSurveyConfirmPageOnyxProps = {
    exitReason: ExitReason | null;
};

function ExitSurveyConfirmPage({exitReason}: ExitSurveyConfirmPageOnyxProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (exitReason) {
            return;
        }
        setIsLoading(false);
    }, [exitReason]);

    return (
        <ScreenWrapper testID={ExitSurveyConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.p5]}>
                <MushroomTopHat />
                <Text style={[styles.headerAnonymousFooter, styles.mt5]}>{translate('exitSurvey.thankYou')}</Text>
                <Text style={[styles.mt2]}>{translate('exitSurvey.thankYouSubtitle')}</Text>
            </View>
            <FixedFooter>
                <Button
                    success
                    text={translate('exitSurvey.goToExpensifyClassic')}
                    onPress={() => {
                        setIsLoading(true);
                        ExitSurvey.switchToOldDot();
                        Link.openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                    }}
                    isLoading={isLoading}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ExitSurveyConfirmPage.displayName = 'ExitSurveyConfirmPage';

export default withOnyx<ExitSurveyConfirmPageOnyxProps, ExitSurveyConfirmPageOnyxProps>({
    exitReason: {
        key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
        selector: (value: OnyxEntry<OnyxTypes.ExitSurveyReasonForm>) => value?.reason ?? null,
    },
})(ExitSurveyConfirmPage);
