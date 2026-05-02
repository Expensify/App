import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';

type GroupProps = {
    children: ReactNode;
};

/** Transparent ARIA `role="group"` wrapper; children self-gate, nested `<Sub>` stays mounted. */
function Group({children}: GroupProps): React.ReactElement {
    return <View role="group">{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
