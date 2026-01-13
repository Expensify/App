import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type PublicDomainErrorPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.PUBLIC_DOMAIN_ERROR>;

function PublicDomainErrorPage({route}: PublicDomainErrorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="PublicDomainErrorPage"
        >
            <HeaderWithBackButton
                title={translate('travel.header')}
                onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
            />
            <View style={[styles.flex1]}>
                <View style={[styles.mt3, styles.mr5, styles.ml5]}>
                    <Text style={styles.headerAnonymousFooter}>{`${translate('travel.publicDomainError.title')}`}</Text>
                </View>
                <View style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>
                    <Text>{translate('travel.publicDomainError.message')}</Text>
                </View>
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={() => Navigation.closeRHPFlow()}
                    text={translate('common.buttonConfirm')}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default PublicDomainErrorPage;
