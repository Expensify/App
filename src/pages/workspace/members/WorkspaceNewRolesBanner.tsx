/** Promotes the Approve-only and Guest roles at the top of the Members page until the admin dismisses it */
import RenderHTML from '@components/RenderHTML';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useShouldShowNewWorkspaceRolesPromotion from '@hooks/useShouldShowNewWorkspaceRolesPromotion';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceNewRolesBannerProps = {
    policy: OnyxEntry<Policy>;
};

function WorkspaceNewRolesBanner({policy}: WorkspaceNewRolesBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const shouldShowBanner = useShouldShowNewWorkspaceRolesPromotion(policy);

    if (!shouldShowBanner) {
        return null;
    }

    return (
        <View style={[styles.ph5, styles.mt3, styles.mb2]}>
            <BillingBanner
                icon={illustrations.Members}
                title={translate('workspace.people.newRolesBanner.title')}
                subtitle={
                    <View style={[styles.renderHTML, styles.mt1]}>
                        <RenderHTML html={translate('workspace.people.newRolesBanner.subtitle')} />
                    </View>
                }
                style={styles.borderRadiusComponentLarge}
                rightIcon={expensifyIcons.Close}
                onRightIconPress={() => dismissProductTraining(CONST.NEW_WORKSPACE_ROLES_BANNER, true)}
                rightIconAccessibilityLabel={translate('common.dismiss')}
                rightIconTooltipText={translate('common.close')}
                rightIconSentryLabel={CONST.SENTRY_LABEL.NEW_WORKSPACE_ROLES_BANNER.DISMISS}
            />
        </View>
    );
}

export default WorkspaceNewRolesBanner;
