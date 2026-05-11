import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {WorkspaceRowData} from '.';

type WorkspaceRowProps = {
    item: WorkspaceRowData;

    rowIndex: number;
};

export default function WorkspaceRow({item, rowIndex}: WorkspaceRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'FallbackWorkspaceAvatar']);

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            onPress={item.action}
            skeletonReasonAttributes={{context: 'WorkspaceRow'}}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar
                            name={item.title}
                            source={item.icon}
                            avatarID={item.policyID}
                            type={CONST.ICON_TYPE_WORKSPACE}
                            size={CONST.AVATAR_SIZE.SMALL}
                            imageStyles={styles.alignSelfCenter}
                            fallbackIcon={icons.FallbackWorkspaceAvatar}
                        />
                        <TextWithTooltip
                            text={item.title}
                            shouldShowTooltip
                            style={[styles.flex1, styles.flexGrow1]}
                        />
                    </View>
                    <View style={[styles.flex1]}></View>
                    <View style={[styles.flex1]}></View>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
