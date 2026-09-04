import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import Button from '@components/ButtonComposed';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {DomainAdminRequestRowData} from '.';

type DomainAdminRequestsTableRowProps = {
    /** Data about the pending adminship request */
    item: DomainAdminRequestRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function DomainAdminRequestsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainAdminRequestsTableRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const accessibilityLabel = [item.name, item.email].filter(Boolean).join(', ');
    const isActionDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const actionButtons = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={item.approve}
                isDisabled={isActionDisabled}
                accessibilityLabel={[translate('domain.admins.approve'), item.name].filter(Boolean).join(', ')}
                sentryLabel={CONST.SENTRY_LABEL.DOMAIN.ADMINS.REQUEST_APPROVE}
            >
                <Button.Text>{translate('domain.admins.approve')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={item.deny}
                isDisabled={isActionDisabled}
                accessibilityLabel={[translate('domain.admins.deny'), item.name].filter(Boolean).join(', ')}
                sentryLabel={CONST.SENTRY_LABEL.DOMAIN.ADMINS.REQUEST_DENY}
            >
                <Button.Text>{translate('domain.admins.deny')}</Button.Text>
            </Button>
        </View>
    );

    return (
        <Table.Row
            interactive={false}
            rowIndex={rowIndex}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.ADMINS.REQUEST_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
                shouldHideOnDelete: false,
            }}
            rowFooter={shouldUseNarrowTableLayout ? actionButtons : undefined}
        >
            <View
                style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled)}
            >
                <AccountAvatar
                    size={avatarSize}
                    accountID={item.accountID}
                    fallbackDisplayName={item.name}
                />
                <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                    <TextWithTooltip
                        shouldShowTooltip
                        text={item.name}
                        style={[styles.optionDisplayName, styles.pre]}
                    />
                    <TextWithTooltip
                        shouldShowTooltip
                        text={item.email}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                    />
                </View>
            </View>

            {!shouldUseNarrowTableLayout && (
                <View
                    style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}
                    {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                >
                    {actionButtons}
                </View>
            )}
        </Table.Row>
    );
}
