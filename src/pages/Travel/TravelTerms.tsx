import React, { useCallback, useEffect, useState } from 'react';
import CheckboxWithLabel from "@components/CheckboxWithLabel";
import HeaderWithBackButton from "@components/HeaderWithBackButton";
import ScreenWrapper from "@components/ScreenWrapper";
import Text from "@components/Text";
import TextLink from "@components/TextLink";
import useLocalize from "@hooks/useLocalize";
import useThemeStyles from "@hooks/useThemeStyles";
import Navigation from "@libs/Navigation/Navigation";
import { ScrollView } from "react-native-gesture-handler";
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import { View } from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

function TravelTerms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [error, setError] = useState(false);

    const errorMessage = error ? 'travel.termsAndConditions.error' :  '';

    const toggleTravelTerms = () => {
        setHasAcceptedTravelTerms(!hasAcceptedTravelTerms);
    };

    useEffect(() => {
        if(!hasAcceptedTravelTerms) {
            return;
        }

        setError(false);
    }, [hasAcceptedTravelTerms]);

    const AgreeToTheLabel = useCallback(() => (
            <Text>
                {`${translate('travel.termsAndConditions.agree')}`}
                <TextLink href="https://www.spotnana.com/terms/">{`${translate('travel.termsAndConditions.termsconditions')}`}</TextLink>
            </Text>
        ), [translate]);
    
    // Add beta support for FullPageNotFound that is universal across travel pages
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelTerms.displayName}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                title={translate('travel.termsAndConditions.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
                <ScrollView style={[styles.flex1, styles.flexGrow1, styles.ph5]}>
                    <View style={styles.flex1}>
                        <Text style={styles.headerAnonymousFooter}>{`${translate('travel.termsAndConditions.title')}`}</Text>
                        <Text style={styles.mt4}>
                            {`${translate('travel.termsAndConditions.subtitle')}`}
                            <TextLink href="https://www.spotnana.com/terms/">{`${translate('travel.termsAndConditions.termsconditions')}.`}</TextLink>
                        </Text>
                        <Text style={styles.mt6}>
                            {`${translate('travel.termsAndConditions.helpDocIntro')}`}
                            <TextLink href="https://use.expensify.com/esignagreement">{`${translate('travel.termsAndConditions.helpDoc')} `}</TextLink>
                            {`${translate('travel.termsAndConditions.helpDocOutro')}`}
                        </Text>
                        <CheckboxWithLabel
                            style={styles.mt6}
                            accessibilityLabel={translate('travel.termsAndConditions.termsconditions')}
                            onInputChange={toggleTravelTerms}
                            LabelComponent={AgreeToTheLabel}
                        />
                    </View>
                </ScrollView>
                <View style={styles.ph5}>
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.continue')}
                        isDisabled={!hasAcceptedTravelTerms}
                        onSubmit={() => {
                            if(!hasAcceptedTravelTerms) {
                                setError(true);
                                return;
                            }

                            // API call for AcceptSpontanaTerms when backend gets implemented
                            setError(false);
                            Navigation.goBack();
                        }}
                        message={errorMessage}
                        isAlertVisible={error || Boolean(errorMessage)}
                        containerStyles={[styles.mh0, styles.mv4]}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    )
}

TravelTerms.displayName = 'TravelMenu';

export default TravelTerms;