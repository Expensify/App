import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components//Icon';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {switchToOldDot} from '@userActions/ExitSurvey';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ExitSurveyResponseForm} from '@src/types/form/ExitSurveyResponseForm';
import RESPONSE_INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ExitSurveyOffline from './ExitSurveyOffline';

type ExitSurveyConfirmPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM>;

const exitResponseSelector = (value: OnyxEntry<ExitSurveyResponseForm>) => value?.[RESPONSE_INPUT_IDS.RESPONSE];

function ExitSurveyConfirmPage({route, navigation}: ExitSurveyConfirmPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['MushroomTopHat']);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const [exitSurveyResponse] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {
        selector: exitResponseSelector,
        canBeMissing: true,
    });
    const shouldShowQuickTips =
        isEmptyObject(tryNewDot) || tryNewDot?.classicRedirect?.dismissed === true || (!isEmptyObject(tryNewDot) && tryNewDot?.classicRedirect?.dismissed === undefined);

    const getBackToParam = useCallback(() => {
        if (isOffline) {
            return ROUTES.SETTINGS;
        }
        if (exitSurveyResponse) {
            return ROUTES.SETTINGS_EXIT_SURVEY_REASON;
        }
        return ROUTES.SETTINGS;
    }, [isOffline, exitSurveyResponse]);
    const {backTo} = route.params || {};
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
        <ScreenWrapper
            testID="ExitSurveyConfirmPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate(shouldShowQuickTips ? 'exitSurvey.goToExpensifyClassic' : 'exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.mh5]}>
                {isOffline && <ExitSurveyOffline />}
                {!isOffline && (
                    <>
                        <Icon
                            src={illustrations.MushroomTopHat}
                            width={variables.mushroomTopHatWidth}
                            height={variables.mushroomTopHatHeight}
                        />
                        <Text style={[styles.headerAnonymousFooter, styles.mt5, styles.textAlignCenter]}>
                            {translate(shouldShowQuickTips ? 'exitSurvey.quickTip' : 'exitSurvey.thankYou')}
                        </Text>
                        <Text style={[styles.mt2, styles.textAlignCenter]}>{translate(shouldShowQuickTips ? 'exitSurvey.quickTipSubTitle' : 'exitSurvey.thankYouSubtitle')}</Text>
                    </>
                )}
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    text={translate(shouldShowQuickTips ? 'exitSurvey.takeMeToExpensifyClassic' : 'exitSurvey.goToExpensifyClassic')}
                    pressOnEnter
                    onPress={() => {
                        switchToOldDot(exitSurveyResponse);
                        Navigation.dismissModal();
                        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
                    }}
                    isDisabled={isOffline}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default ExitSurveyConfirmPage;
