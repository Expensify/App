import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import navigateToWiseGlobalReimbursements from '@libs/Navigation/helpers/navigateToWiseGlobalReimbursements';

import variables from '@styles/variables';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type WiseSetupInProgressRowProps = {
    bankAccountID: number;

    /** Whether the admin left the onboarding before Submit, so Continue reopens it */
    canContinue: boolean;

    /** Spacing for the row, which follows the list it sits in */
    style?: StyleProp<ViewStyle>;
};

/** Tells the admin under the Wallet bank account row that its global reimbursements setup is not finished */
function WiseSetupInProgressRow({bankAccountID, canContinue, style}: WiseSetupInProgressRowProps) {
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
                            onPress={() => navigateToWiseGlobalReimbursements(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)), true)}
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
