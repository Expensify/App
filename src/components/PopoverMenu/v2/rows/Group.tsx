import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useContentActions} from '@components/PopoverMenu/v2/content/ContentContext';

type GroupProps = {
    children: ReactNode;
};

/** Transparent ARIA `role="group"` wrapper; children self-gate, nested `<Sub>` stays mounted. */
function Group({children}: GroupProps): React.ReactElement {
    // Result discarded — call exists purely to attribute "outside <Content>" errors to <Group>,
    // since Group itself has no content-context dependency to surface them naturally.
    useContentActions(Group.displayName);
    return <View role="group">{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
