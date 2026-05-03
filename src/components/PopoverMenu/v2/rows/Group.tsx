import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useContentActions} from '@components/PopoverMenu/v2/content/ContentContext';

type GroupProps = {
    children: ReactNode;
};

function Group({children}: GroupProps): React.ReactElement {
    // Result discarded — attributes hierarchy violations to <Group>, which otherwise touches no context.
    useContentActions(Group.displayName);
    return <View role="group">{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
