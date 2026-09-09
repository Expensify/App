import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import MenuItem from '@components/MenuItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceRowProps = {
    policyID: string;

    /** Undefined when the workspace is not available to the current user */
    policy: OnyxEntry<Policy>;

    /** The last row of a section skips the separator */
    shouldShowSeparator: boolean;
};

function WorkspaceRow({policyID, policy, shouldShowSeparator}: WorkspaceRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const title = policy?.name ?? translate('workspace.common.unavailable');

    return (
        <View style={shouldShowSeparator ? styles.borderBottom : undefined}>
            <MenuItem.Root>
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <WorkspaceAvatar
                            source={policy?.avatarURL}
                            name={title}
                            avatarID={policyID}
                        />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{title}</MenuItem.Title>
                        <MenuItem.Description numberOfLines={1}>{translate('workspace.common.workspace')}</MenuItem.Description>
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </View>
    );
}

WorkspaceRow.displayName = 'WorkspaceRow';

export default WorkspaceRow;
