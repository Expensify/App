import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import type {ComponentRef, ReactNode} from 'react';

import React, {useRef} from 'react';
import {View} from 'react-native';

type ReceiptPartnerConnectionRowProps = {
    /** Partner logo */
    icon: AvatarSource;

    /** Partner name */
    title: string;

    /** Line under the partner name */
    description: string;

    /** Items of the three-dots menu. When non-empty, the menu replaces the setup button */
    overflowMenuItems?: PopoverMenuItem[];

    /** Starts the partner's connection flow */
    onSetUp: () => void;

    /** Whether the setup button shows a spinner */
    isSetUpLoading?: boolean;

    /** Whether the user lacks write access. The setup button looks disabled but stays pressable so `onSetUp` can explain why */
    isReadOnly?: boolean;

    /** Optional badge next to the partner name */
    badge?: {
        text: string;
        onPress?: () => void;
    };

    /** Whether to show the error brick road indicator */
    hasError?: boolean;

    /** Error shown under the row */
    errorMessage?: ReactNode;
};

function ReceiptPartnerConnectionRow({
    icon,
    title,
    description,
    overflowMenuItems = [],
    onSetUp,
    isSetUpLoading,
    isReadOnly,
    badge,
    hasError,
    errorMessage,
}: ReceiptPartnerConnectionRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const overflowMenuAnchorRef = useRef<ComponentRef<typeof View>>(null);

    const getOverflowMenuAnchorPosition = () => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }
        return new Promise<AnchorPosition>((resolve) => {
            overflowMenuAnchorRef.current?.measureInWindow((x, y, width, height) => {
                resolve({horizontal: x + width, vertical: y + height});
            });
        });
    };

    const badgeElement = !!badge && (
        <Badge
            text={badge.text}
            success
            onPress={badge.onPress}
            pressable={!!badge.onPress}
            badgeStyles={shouldUseNarrowLayout ? [styles.alignSelfStart, styles.ml13, styles.mt2] : [styles.ml0, hasError && styles.mr1]}
        />
    );

    const action =
        overflowMenuItems.length > 0 ? (
            <View ref={overflowMenuAnchorRef}>
                <ThreeDotsMenu
                    getAnchorPosition={getOverflowMenuAnchorPosition}
                    menuItems={overflowMenuItems}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                />
            </View>
        ) : (
            <Button
                onPress={onSetUp}
                style={styles.justifyContentCenter}
                innerStyles={isReadOnly ? styles.buttonOpacityDisabled : undefined}
                hoverStyles={isReadOnly ? styles.buttonOpacityDisabled : undefined}
                size={CONST.BUTTON_SIZE.SMALL}
                isLoading={isSetUpLoading}
                isDisabled={!isReadOnly && isOffline}
            >
                <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
            </Button>
        );

    return (
        <OfflineWithFeedback shouldDisableStrikeThrough>
            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <UserAvatar
                            source={icon}
                            accountID={CONST.DEFAULT_NUMBER_ID}
                        />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{title}</MenuItem.Title>
                        <MenuItem.Description numberOfLines={5}>{description}</MenuItem.Description>
                    </MenuItem.Content>
                    <MenuItem.Trailing>
                        {!shouldUseNarrowLayout && badgeElement}
                        {!!hasError && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                        {action}
                    </MenuItem.Trailing>
                </MenuItem.Row>
                {shouldUseNarrowLayout && badgeElement}
                {!!errorMessage && (
                    <FormHelpMessage
                        isError
                        shouldShowRedDotIndicator={false}
                        message={errorMessage}
                        style={[styles.menuItemError, styles.mt3]}
                    />
                )}
            </MenuItemSectionRoot>
        </OfflineWithFeedback>
    );
}

export default ReceiptPartnerConnectionRow;
export type {ReceiptPartnerConnectionRowProps};
