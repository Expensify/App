import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import MenuItem from '@components/MenuItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type WorkspaceRowProps = {
    policyID: string;

    title: string;

    avatarURL: string | undefined;

    /** The last row of a section skips the separator */
    shouldShowSeparator: boolean;
};

function WorkspaceRow({policyID, title, avatarURL, shouldShowSeparator}: WorkspaceRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={shouldShowSeparator ? styles.borderBottom : undefined}>
            <MenuItem.Root>
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <WorkspaceAvatar
                            source={avatarURL}
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

export default WorkspaceRow;
