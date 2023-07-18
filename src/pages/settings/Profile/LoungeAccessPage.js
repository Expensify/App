import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as Illustrations from '../../../components/Icon/Illustrations';
import ONYXKEYS from '../../../ONYXKEYS';
import userPropTypes from '../userPropTypes';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import useLocalize from '../../../hooks/useLocalize';
import FeatureList from '../../../components/FeatureList';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';

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

    /*
     * The correct aspect ratio for this animation for our product is 375:240 (0.64).
     * However, the existing lottie animation file has aspect ratio 1920:1080 (0.5625)
     * So that means that we can get the correct aspect ratio with the following adjustment:
     *
     * existingAspectRatio x widthAdjustment = desiredAspectRatio
     * => 0.5625 x widthAdjustment = 0.64
     * => widthAdjustment = 0.64 / 0.5625
     * => widthAdjustment = 1.1377
     */
    const illustrationStyle = {
        width: '114%',
    };

    if (!user.hasLoungeAccess) {
        return <FullPageNotFoundView shouldShow />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.ExpensifyLounge}
            illustrationStyle={illustrationStyle}
        >
            <FeatureList
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
