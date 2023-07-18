import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import * as Illustrations from '../../../components/Icon/Illustrations';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import userPropTypes from '../userPropTypes';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import useLocalize from '../../../hooks/useLocalize';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import FeatureList from '../../../components/FeatureList';

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

function LoungeAccessPage(props) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    const illustrationStyle = isSmallScreenWidth
        ? {
              width: windowWidth,
              height: CONST.SETTINGS_LOUNGE_ACCESS.HEADER_IMAGE_ASPECT_RATIO * windowWidth,
          }
        : {};

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!props.user.hasLoungeAccess}>
                    <HeaderWithBackButton
                        title={translate('loungeAccessPage.loungeAccess')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                    />
                    <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                        <View style={illustrationStyle}>
                            <Illustrations.Lounge />
                        </View>
                        <View style={styles.pageWrapperNotCentered}>
                            <Text
                                style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                                numberOfLines={2}
                            >
                                {translate('loungeAccessPage.headline')}
                            </Text>
                            <Text style={styles.baseFontStyle}>{translate('loungeAccessPage.description')}</Text>
                        </View>
                        <FeatureList menuItems={menuItems} />
                    </ScrollView>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
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
