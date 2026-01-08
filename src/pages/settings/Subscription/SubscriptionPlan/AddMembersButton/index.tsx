import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function AddMembersButton() {
    const icons = useMemoizedLazyExpensifyIcons(['UserPlus']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!activePolicy || activePolicy.type === CONST.POLICY.TYPE.PERSONAL) {
        return null;
    }

    return (
        <Button
            text={translate('subscription.yourPlan.addMembers')}
            style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
            icon={icons.UserPlus}
            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(activePolicyID))}
        />
    );
}

export default AddMembersButton;
