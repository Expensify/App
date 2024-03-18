import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import SubscriptAvatar from './SubscriptAvatar';
import Tooltip from './Tooltip';

type WorkspaceSwitcherButtonOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type WorkspaceSwitcherButtonProps = WorkspaceSwitcherButtonOnyxProps;

function WorkspaceSwitcherButton({policy}: WorkspaceSwitcherButtonProps) {
    const {translate} = useLocalize();
    const theme = useTheme();

    const {source, name, type} = useMemo(() => {
        if (!policy) {
            return {source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatar ? policy.avatar : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name ?? '',
            type: CONST.ICON_TYPE_WORKSPACE,
        };
    }, [policy]);

    return (
        <Tooltip text={translate('workspace.switcher.headerTitle')}>
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
                {({hovered}) => (
                    <SubscriptAvatar
                        mainAvatar={{source, name, type}}
                        subscriptIcon={{
                            source: Expensicons.DownArrow,
                            width: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE,
                            height: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE,
                            fill: theme.icon,
                        }}
                        showTooltip={false}
                        noMargin
                        subscriptionContainerAdditionalStyles={hovered && {backgroundColor: theme.buttonHoveredBG}}
                    />
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

WorkspaceSwitcherButton.displayName = 'WorkspaceSwitcherButton';

export default WorkspaceSwitcherButton;
