import React, {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import SubscriptAvatar from './SubscriptAvatar';

type WorkspaceSwitcherButtonOnyxProps = {
    policies: OnyxCollection<Policy>;
};

type WorkspaceSwitcherButtonProps = WorkspaceSwitcherButtonOnyxProps;

function WorkspaceSwitcherButton({policies}: WorkspaceSwitcherButtonProps) {
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();
    const policy = useMemo(() => (policies && activeWorkspaceID ? policies[`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID}`] : null), [policies, activeWorkspaceID]);

    const {source, name, type} = useMemo(() => {
        if (!policy) {
            return {source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatar ? policy.avatar : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name,
            type: CONST.ICON_TYPE_WORKSPACE,
        };
    }, [policy]);

    return (
        <PressableWithFeedback
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.workspaces')}
            accessible
            onPress={() =>
                interceptAnonymousUser(() => {
                    Navigation.navigate(ROUTES.WORKSPACE_SWITCHER);
                })
            }
        >
            <SubscriptAvatar
                mainAvatar={{source, name, type}}
                subscriptIcon={{source: Expensicons.DownArrow, width: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE, height: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE}}
                showTooltip={false}
                noMargin
            />
        </PressableWithFeedback>
    );
}

WorkspaceSwitcherButton.displayName = 'WorkspaceSwitcherButton';

export default withOnyx<WorkspaceSwitcherButtonProps, WorkspaceSwitcherButtonOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        selector: (policy: OnyxEntry<Policy>) => policy && {avatar: policy.avatar, name: policy.name},
    },
})(WorkspaceSwitcherButton);
