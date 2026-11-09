/** Keeps an illustrated benefit informational while its parent owns the call to action. */
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import MenuItem from './MenuItem';

type FeatureListItemProps = {
    icon: IconAsset;
    children: string;
};

function FeatureListItem({icon, children}: FeatureListItemProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.w100}>
            <MenuItem.Root style={[styles.p0, styles.cursorAuto]}>
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={icon}
                                width={variables.menuIconSize}
                                height={variables.menuIconSize}
                            />
                        </View>
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title numberOfLines={0}>{children}</MenuItem.Title>
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </View>
    );
}

export default FeatureListItem;
