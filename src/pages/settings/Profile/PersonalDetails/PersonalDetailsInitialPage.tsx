import React from 'react';
import {ScrollView, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type PersonalDetailsInitialPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type PersonalDetailsInitialPageProps = PersonalDetailsInitialPageOnyxProps;

function PersonalDetailsInitialPage({privatePersonalDetails}: PersonalDetailsInitialPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    usePrivatePersonalDetails();
    const legalName = `${privatePersonalDetails?.legalFirstName ?? ''} ${privatePersonalDetails?.legalLastName ?? ''}`.trim();
    const isLoadingPersonalDetails = privatePersonalDetails?.isLoading ?? true;

    return (
        <ScreenWrapper testID={PersonalDetailsInitialPage.displayName}>
            <HeaderWithBackButton
                title={translate('privatePersonalDetails.personalDetails')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {isLoadingPersonalDetails ? (
                <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <ScrollView>
                    <View style={styles.flex1}>
                        <View style={[styles.ph5, styles.mb5]}>
                            <Text>{translate('privatePersonalDetails.privateDataMessage')}</Text>
                        </View>
                        <MenuItemGroup>
                            <MenuItemWithTopDescription
                                title={legalName}
                                description={translate('privatePersonalDetails.legalName')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_LEGAL_NAME)}
                            />
                            <MenuItemWithTopDescription
                                title={privatePersonalDetails?.dob ?? ''}
                                description={translate('common.dob')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                                titleStyle={styles.flex1}
                            />
                            <MenuItemWithTopDescription
                                title={PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails)}
                                description={translate('privatePersonalDetails.address')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                            />
                        </MenuItemGroup>
                    </View>
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

PersonalDetailsInitialPage.displayName = 'PersonalDetailsInitialPage';

export default withOnyx<PersonalDetailsInitialPageProps, PersonalDetailsInitialPageOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(PersonalDetailsInitialPage);
