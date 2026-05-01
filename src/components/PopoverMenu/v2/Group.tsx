import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useIsAtActiveLevel} from './SubContext';

type GroupProps = {
    children: ReactNode;
};

/** ARIA grouping wrapper for related rows; renders as `role="group"` on web, no-op semantics on native. */
function Group({children}: GroupProps): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel();

    if (!isAtActiveLevel) {
        return null;
    }

    return <View role="group">{children}</View>;
}

Group.displayName = 'PopoverMenu.Group';

export default Group;
export type {GroupProps};
