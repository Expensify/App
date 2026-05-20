import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import CONST from '@src/CONST';

type GroupProps = {
    children: ReactNode;
};

/** Stays mounted across sub-navigation so `<Sub>` descendants don't unmount. */
function Group({children}: GroupProps): React.ReactElement {
    useContentSubActions(Group.displayName);
    return <View role={CONST.ROLE.GROUP}>{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
