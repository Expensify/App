import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {User} from '@src/types/onyx';

type LoungeAccessPageOnyxProps = {
    user: OnyxEntry<User>;
};

type LoungeAccessPageProps = LoungeAccessPageOnyxProps & WithCurrentUserPersonalDetailsProps;

function LoungeAccessPage({user}: LoungeAccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!user?.hasLoungeAccess) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack()}
            illustration={LottieAnimations.ExpensifyLounge}
            testID={LoungeAccessPage.displayName}
        >
            <Text
                style={[styles.flex1, styles.ph5, styles.textHeadline, styles.preWrap, styles.mb2]}
                numberOfLines={1}
            >
                {translate('loungeAccessPage.headline')}
            </Text>
            <Text style={[styles.flex1, styles.ph5, styles.webViewStyles.baseFontStyle]}>{translate('loungeAccessPage.description')}</Text>
        </IllustratedHeaderPageLayout>
    );
}

LoungeAccessPage.displayName = 'LoungeAccessPage';

export default withCurrentUserPersonalDetails(
    withOnyx<LoungeAccessPageProps, LoungeAccessPageOnyxProps>({
        user: {
            key: ONYXKEYS.USER,
        },
    })(LoungeAccessPage),
);
