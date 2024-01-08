import React from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import SubscriptAvatar from './SubscriptAvatar';

function WorkspaceSwitcherButton() {
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.workspaces')}
            accessible
            onPress={() => {}}
        >
            <SubscriptAvatar
                mainAvatar={{source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR}}
                subscriptIcon={{source: Expensicons.DownArrow, width: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE, height: CONST.WORKSPACE_SWITCHER.SUBSCRIPT_ICON_SIZE}}
                showTooltip={false}
                noMargin
            />
        </PressableWithFeedback>
    );
}

WorkspaceSwitcherButton.displayName = 'WorkspaceSwitcherButton';

export default WorkspaceSwitcherButton;
