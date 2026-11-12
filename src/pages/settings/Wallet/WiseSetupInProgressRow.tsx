/** The line under a Wallet bank account whose Wise global reimbursements setup is not finished, with a link to where the admin can pick it up or follow it */
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

/** While the admin has something to do they continue the setup, and while Wise reviews it the admin can only check its status */
const COPY = {
    inProgress: {message: 'walletPage.wiseSetupInProgress.message', link: 'walletPage.wiseSetupInProgress.continue'},
    inReview: {message: 'walletPage.wiseSetupInReview.message', link: 'walletPage.wiseSetupInReview.checkStatus'},
} as const satisfies Record<string, {message: TranslationPaths; link: TranslationPaths}>;

type WiseSetupInProgressRowProps = {
    bankAccountID: number;

    /** Whether Wise is reviewing the onboarding with nothing for the admin to do, so the row says it is in review instead of offering to continue it */
    isInReview: boolean;

    /** Whether the onboarding is already with Wise, so the row links to the status page instead of the intro */
    isOnboardingSubmitted: boolean;

    /** Spacing for the row, which follows the list it sits in */
    style?: StyleProp<ViewStyle>;
};

/** Tells the admin under the Wallet bank account row that its global reimbursements setup is not finished */
function WiseSetupInProgressRow({bankAccountID, isInReview, isOnboardingSubmitted, style}: WiseSetupInProgressRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass']);
    const copy = isInReview ? COPY.inReview : COPY.inProgress;

    const linkRoute = isOnboardingSubmitted ? getWiseOnboardingStatusRoute(bankAccountID) : createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID));

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, style]}>
            <Icon
                src={icons.Hourglass}
                fill={theme.textSupporting}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                additionalStyles={[styles.mr1]}
            />
            <Text
                variant="label"
                style={[styles.textSupporting, styles.flexShrink1]}
            >
                {translate(copy.message)}{' '}
                <TextLink
                    variant="label"
                    onPress={() => Navigation.navigate(linkRoute)}
                >
                    {translate(copy.link)}
                </TextLink>
            </Text>
        </View>
    );
}

export default WiseSetupInProgressRow;
