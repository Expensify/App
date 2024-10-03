import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Travel from '@userActions/Travel';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function TravelTerms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const isLoading = travelSettings?.isLoading;

    const toggleTravelTerms = () => {
        setHasAcceptedTravelTerms(!hasAcceptedTravelTerms);
    };

    useEffect(() => {
        if (!hasAcceptedTravelTerms) {
            return;
        }

        setErrorMessage('');
    }, [hasAcceptedTravelTerms]);

    const AgreeToTheLabel = useCallback(
        () => (
            <Text>
                {translate('travel.termsAndConditions.agree')}
                <TextLink href={CONST.TRAVEL_TERMS_URL}>{translate('travel.termsAndConditions.travelTermsAndConditions')}</TextLink>
            </Text>
        ),
        [translate],
    );

    // Add beta support for FullPageNotFound that is universal across travel pages
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelTerms.displayName}
        >
            <FullPageNotFoundView shouldShow={!canUseSpotnanaTravel}>
                <HeaderWithBackButton
                    title={translate('travel.termsAndConditions.header')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SafeAreaConsumer>
                    {({safeAreaPaddingBottomStyle}) => (
                        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, safeAreaPaddingBottomStyle.paddingBottom ? safeAreaPaddingBottomStyle : styles.pb5]}>
                            <View style={styles.flex1}>
                                <Text style={styles.headerAnonymousFooter}>{translate('travel.termsAndConditions.title')}</Text>
                                <Text style={styles.mt4}>
                                    {translate('travel.termsAndConditions.subtitle')}
                                    <TextLink href={CONST.TRAVEL_TERMS_URL}>{`${translate('travel.termsAndConditions.termsconditions')}.`}</TextLink>
                                </Text>
                                <Text style={styles.mt6}>
                                    {translate('travel.termsAndConditions.helpDocIntro')}
                                    <TextLink href="https://use.expensify.com/esignagreement">{`${translate('travel.termsAndConditions.helpDoc')} `}</TextLink>
                                    {translate('travel.termsAndConditions.helpDocOutro')}
                                </Text>
                                <CheckboxWithLabel
                                    style={styles.mt6}
                                    accessibilityLabel={translate('travel.termsAndConditions.travelTermsAndConditions')}
                                    onInputChange={toggleTravelTerms}
                                    LabelComponent={AgreeToTheLabel}
                                />
                            </View>

                            <FormAlertWithSubmitButton
                                buttonText={translate('common.continue')}
                                isDisabled={!hasAcceptedTravelTerms}
                                onSubmit={() => {
                                    if (!hasAcceptedTravelTerms) {
                                        setErrorMessage(translate('travel.termsAndConditions.error'));
                                        return;
                                    }
                                    if (errorMessage) {
                                        setErrorMessage('');
                                    }

                                    Travel.acceptSpotnanaTerms()
                                        .then(() => Navigation.goBack())
                                        .catch(() => setErrorMessage(translate('travel.errorMessage')));
                                }}
                                message={errorMessage}
                                isAlertVisible={!!errorMessage}
                                containerStyles={[styles.mh0, styles.mt5]}
                                isLoading={isLoading}
                            />
                        </ScrollView>
                    )}
                </SafeAreaConsumer>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TravelTerms.displayName = 'TravelMenu';

export default TravelTerms;
