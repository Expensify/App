/** The line under a Wallet bank account whose Wise global reimbursements setup is not finished, with Continue when the admin has something to do */
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

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type WiseSetupInProgressRowProps = {
    bankAccountID: number;

    /** Whether the admin has something to do, which shows Continue to the intro that picks the setup up */
    canContinue: boolean;

    /** Whether the onboarding is already with Wise, so Continue opens the status page instead of the intro */
    isOnboardingSubmitted: boolean;

    /** Spacing for the row, which follows the list it sits in */
    style?: StyleProp<ViewStyle>;
};

/** Tells the admin under the Wallet bank account row that its global reimbursements setup is not finished */
function WiseSetupInProgressRow({bankAccountID, canContinue, isOnboardingSubmitted, style}: WiseSetupInProgressRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass']);

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
                {translate('walletPage.wiseSetupInProgress.message')}
                {canContinue && (
                    <>
                        {' '}
                        <TextLink
                            variant="label"
                            onPress={() =>
                                isOnboardingSubmitted
                                    ? Navigation.navigate(getWiseOnboardingStatusRoute(bankAccountID))
                                    : Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)))
                            }
                        >
                            {translate('walletPage.wiseSetupInProgress.continue')}
                        </TextLink>
                    </>
                )}
            </Text>
        </View>
    );
}

export default WiseSetupInProgressRow;
