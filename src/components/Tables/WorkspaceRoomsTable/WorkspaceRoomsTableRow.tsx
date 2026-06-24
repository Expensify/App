import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {TableData} from '@components/Table';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type WorkspaceRoomRowData = TableData & {
    /** The room reportID */
    reportID: string;

    /** The room display name */
    name: string;

    /** Number of members in the room */
    memberCount: number;

    /** Callback fired when the row is pressed */
    action: () => void;
};

type WorkspaceRoomsTableRowProps = {
    /** The room data */
    item: WorkspaceRoomRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether or not the row should animate in highlighted */
    shouldAnimateInHighlight?: boolean;
};

function WorkspaceRoomsTableRow({item, rowIndex, shouldUseNarrowTableLayout, shouldAnimateInHighlight}: WorkspaceRoomsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const memberCountSubtitle = translate('domain.groups.memberCount', {count: item.memberCount});

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            accessibilityLabel={item.name}
            skeletonReasonAttributes={{context: 'WorkspaceRoomsTableRow'}}
            onPress={item.action}
            shouldAnimateInHighlight={shouldAnimateInHighlight}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                            <ReportActionAvatars
                                noRightMarginOnSubscriptContainer
                                singleAvatarContainerStyle={[styles.mr0]}
                                subscriptAvatarBorderColor={hovered ? theme.hoverComponentBG : theme.highlightBG}
                                reportID={item.reportID}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                            />
                            <View style={[styles.flex1, styles.gap1]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.name}
                                    style={styles.optionDisplayName}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={styles.textLabelSupporting}
                                >
                                    {memberCountSubtitle}
                                </Text>
                            </View>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <>
                            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                                <ReportActionAvatars
                                    noRightMarginOnSubscriptContainer
                                    singleAvatarContainerStyle={[styles.mr0]}
                                    subscriptAvatarBorderColor={hovered ? theme.hoverComponentBG : theme.highlightBG}
                                    reportID={item.reportID}
                                    size={CONST.AVATAR_SIZE.SMALL}
                                />
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.name}
                                    style={[styles.optionDisplayName, styles.flexShrink1]}
                                />
                            </View>

                            <View style={styles.flex1}>
                                <Text numberOfLines={1}>{item.memberCount}</Text>
                            </View>

                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={[styles.alignSelfCenter]}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </View>
                        </>
                    )}
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceRoomsTableRow;
export type {WorkspaceRoomRowData};
