import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import CONST from '@src/CONST';

type GroupProps = {
    accessibilityLabel?: string;
    children: ReactNode;
};

function Group({accessibilityLabel, children}: GroupProps): React.ReactElement {
    useContent(Group.displayName);
    return (
        <View
            role={CONST.ROLE.GROUP}
            accessibilityLabel={accessibilityLabel}
        >
            {children}
        </View>
    );
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
