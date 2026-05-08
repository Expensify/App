import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';

type GroupProps = {
    children: ReactNode;
};

function Group({children}: GroupProps): React.ReactElement {
    useContentSubActions(Group.displayName);
    return <View role="group">{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
