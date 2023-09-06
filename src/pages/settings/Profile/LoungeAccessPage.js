import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import * as Lounge from '../../../libs/actions/Lounge';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import userPropTypes from '../userPropTypes';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import useLocalize from '../../../hooks/useLocalize';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FeatureList from '../../../components/FeatureList';
import * as Illustrations from '../../../components/Icon/Illustrations';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';
import styles from '../../../styles/styles';

const propTypes = {
    /** Current user details, which will hold whether or not they have Lounge Access */
    user: userPropTypes,
};

const defaultProps = {
    user: {},
};

const menuItems = [
    {
        translationKey: 'loungeAccessPage.coffeePromo',
        icon: Illustrations.CoffeeMug,
    },
    {
        translationKey: 'loungeAccessPage.networkingPromo',
        icon: Illustrations.ChatBubbles,
    },
    {
        translationKey: 'loungeAccessPage.viewsPromo',
        icon: Illustrations.SanFrancisco,
    },
];

function LoungeAccessPage({user}) {
    const {translate} = useLocalize();
    const isCheckedIn = false;
    const numberOfCheckInsLeft = 6;

    if (!user.hasLoungeAccess) {
        return <NotFoundPage />;
    }

    const checkIn = () => {
        console.log('Check in');
        Lounge.recordLoungeVisit();
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.ExpensifyLounge}
        >
            <View style={[styles.w100, styles.ph5, styles.pb8]}>
                <Text style={[styles.textStrong, styles.mb4]}>{translate('loungeAccessPage.checkIn')}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('loungeAccessPage.addressLabel')}</Text>
                <Text style={[styles.mb4]}>{translate('loungeAccessPage.address')}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('loungeAccessPage.nextCheckInLabel')}</Text>
                <Text style={[styles.mb4]}>
                    {isCheckedIn ? translate('loungeAccessPage.nextCheckInBeforeNumberCheckedIn') : translate('loungeAccessPage.nextCheckInBeforeNumberCheckIn')}
                    {' '}
                    {/* TODO: Localize numbers as well */}
                    <Text style={[styles.textStrong]}>
                        {numberOfCheckInsLeft}
                        {' '}
                        {numberOfCheckInsLeft === 1 ? translate('loungeAccessPage.nextCheckInNumberCountSingular') : translate('loungeAccessPage.nextCheckInNumberCountPlural')}
                    </Text>
                    {' '}
                    {translate('loungeAccessPage.nextCheckInAfterNumber')}
                </Text>
                <Button
                    style={[styles.w100]}
                    text={translate('loungeAccessPage.checkIn')}
                    onPress={checkIn}
                    success
                />
            </View>
            <FeatureList
                headlineType="strong"
                headline="loungeAccessPage.headline"
                description="loungeAccessPage.description"
                menuItems={menuItems}
            />
        </IllustratedHeaderPageLayout>
    );
}

LoungeAccessPage.propTypes = propTypes;
LoungeAccessPage.defaultProps = defaultProps;
LoungeAccessPage.displayName = 'LoungeAccessPage';

export default withOnyx({
    user: {
        key: ONYXKEYS.USER,
    },
})(LoungeAccessPage);
