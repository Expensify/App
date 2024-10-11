import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components//Icon';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {MushroomTopHat} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as ExitSurvey from '@userActions/ExitSurvey';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ExitReason, ExitSurveyReasonForm} from '@src/types/form/ExitSurveyReasonForm';
import EXIT_SURVEY_REASON_INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';
import ExitSurveyOffline from './ExitSurveyOffline';

type ExitSurveyConfirmPageOnyxProps = {
    exitReason?: ExitReason | null;
};

type ExitSurveyConfirmPageProps = ExitSurveyConfirmPageOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM>;

function ExitSurveyConfirmPage({exitReason, route, navigation}: ExitSurveyConfirmPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const getBackToParam = useCallback(() => {
        if (isOffline) {
            return ROUTES.SETTINGS;
        }
        if (exitReason) {
            return ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(exitReason, ROUTES.SETTINGS_EXIT_SURVEY_REASON);
        }
        return ROUTES.SETTINGS;
    }, [exitReason, isOffline]);
    const {backTo} = route.params;
    useEffect(() => {
        const newBackTo = getBackToParam();
        if (backTo === newBackTo) {
            return;
        }
        navigation.setParams({
            backTo: newBackTo,
        });
    }, [backTo, getBackToParam, navigation]);

    return (
        <ScreenWrapper testID={ExitSurveyConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.mh5]}>
                {isOffline && <ExitSurveyOffline />}
                {!isOffline && (
                    <>
                        <Icon
                            src={MushroomTopHat}
                            width={variables.mushroomTopHatWidth}
                            height={variables.mushroomTopHatHeight}
                        />
                        <Text style={[styles.headerAnonymousFooter, styles.mt5, styles.textAlignCenter]}>{translate('exitSurvey.thankYou')}</Text>
                        <Text style={[styles.mt2, styles.textAlignCenter]}>{translate('exitSurvey.thankYouSubtitle')}</Text>
                    </>
                )}
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    text={translate('exitSurvey.goToExpensifyClassic')}
                    onPress={() => {
                        ExitSurvey.switchToOldDot();
                        Navigation.dismissModal();
                        Link.openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                    }}
                    isDisabled={isOffline}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ExitSurveyConfirmPage.displayName = 'ExitSurveyConfirmPage';

export default withOnyx<ExitSurveyConfirmPageProps, ExitSurveyConfirmPageOnyxProps>({
    exitReason: {
        key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
        selector: (value: OnyxEntry<ExitSurveyReasonForm>) => value?.[EXIT_SURVEY_REASON_INPUT_IDS.REASON] ?? null,
    },
})(ExitSurveyConfirmPage);
