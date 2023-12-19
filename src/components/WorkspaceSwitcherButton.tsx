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
                mainAvatar={{source: Expensicons.ExpensifyAppIcon, name: 'Expensify', type: CONST.ICON_TYPE_AVATAR}}
                subscriptIcon={{source: Expensicons.DownArrow, width: 8, height: 8}}
                showTooltip={false}
                noMargin
            />
        </PressableWithFeedback>
    );
}

WorkspaceSwitcherButton.displayName = 'WorkspaceSwitcherButton';

export default WorkspaceSwitcherButton;
