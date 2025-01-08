import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as Link from '@userActions/Link';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ExitSurveyOffline from './ExitSurveyOffline';

function ExitSurveyBookCallPage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper testID={ExitSurveyBookCallPage.displayName}>
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('exitSurvey.header')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1, styles.mh5]}>
                    {isOffline && <ExitSurveyOffline />}
                    {!isOffline && (
                        <>
                            <Text style={[styles.headerAnonymousFooter, styles.mt3]}>{translate('exitSurvey.bookACallTitle')}</Text>
                            <Text style={[styles.mt2]}>{translate('exitSurvey.bookACallTextTop')}</Text>
                            <View style={styles.mv4}>
                                {Object.values(CONST.EXIT_SURVEY.BENEFIT).map((value) => {
                                    return (
                                        <View
                                            key={value}
                                            style={[styles.flexRow]}
                                        >
                                            <View style={styles.liDot} />
                                            <Text>{translate(`exitSurvey.benefits.${value}`)}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text>{translate('exitSurvey.bookACallTextBottom')}</Text>
                        </>
                    )}
                </View>
                <FixedFooter>
                    <Button
                        style={styles.mb3}
                        large
                        text={translate('exitSurvey.noThanks')}
                        onPress={() => {
                            Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_REASON.getRoute(ROUTES.SETTINGS_EXIT_SURVERY_BOOK_CALL.route));
                        }}
                        isDisabled={isOffline}
                    />
                    <Button
                        success
                        large
                        iconRight={Expensicons.NewWindow}
                        shouldShowRightIcon
                        isContentCentered
                        text={translate('exitSurvey.bookACall')}
                        pressOnEnter
                        onPress={() => {
                            Navigation.dismissModal();
                            Link.openExternalLink(CONST.EXIT_SURVEY.BOOK_MEETING_LINK);
                        }}
                        isDisabled={isOffline}
                    />
                </FixedFooter>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

ExitSurveyBookCallPage.displayName = 'ExitSurveyBookCallPage';

export default ExitSurveyBookCallPage;
