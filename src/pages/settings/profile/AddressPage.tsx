import React, {useCallback, useEffect, useState} from 'react';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigationParam} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';

import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInputWithLabel from '@components/TextInputWithLabel';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';

function AddressPage() {
    const {translate} = useLocalize();
    const route = useRoute();
    const {country} = route.params;
    const stateFromNavigation = useNavigationParam('state');
    const [state, setState] = useState(stateFromNavigation ?? '');

    // Check if the state parameter is present in the URL and update the state if it is.
    useEffect(() => {
        const getUrlParams = async () => {
            const url = await Linking.getInitialURL();
            if (url) {
                const urlObject = new URL(url);
                const params = urlObject.searchParams;
                const stateParam = params.get('state');
                if (stateParam) {
                    setState(stateParam);
                }
            }
        };

        getUrlParams();
    }, []);

    const handleStateChange = useCallback((value: string) => {
        setState(value);
    }, []);

    const handleSave = useCallback(() => {
        PersonalDetails.updateUserPersonalDetails({state});
        Navigation.goBack();
    }, [state]);

    const isStateRequired = country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA;

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('common.state')}
                onPressBackButton={Navigation.goBack}
                onPressSave={handleSave}
            />
            <ScrollView contentContainerStyle={styles.flex1}>
                <View style={styles.formContainer}>
                    {isStateRequired && (
                        <TextInputWithLabel
                            label={translate('common.state')}
                            value={state}
                            onChangeText={handleStateChange}
                            placeholder={translate('common.state')}
                        />
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

AddressPage.displayName = 'AddressPage';

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    formContainer: {
        padding: 16,
    },
});

export default AddressPage;
