import React, {useMemo} from 'react';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import DomainsListRow from './DomainsListRow';

type DomainMenuItemProps = {
    /** Domain menu item data */
    item: DomainItem;

    /** Row index in the menu */
    index: number;
};

type DomainItem = {
    /** Type of menu item row in the list of workspaces and domains  */
    listItemType: 'domain';

    /** Main text to show in the row */
    title: string;

    /** Function to run after clicking on the row */
    action: () => void;

    /** ID of the row's domain */
    accountID: number;

    /** Whether the user is an admin of the row's domain */
    isAdmin: boolean;

    /** Whether the row's domain is validated (aka verified) */
    isValidated: boolean;
} & Pick<OfflineWithFeedbackProps, 'pendingAction'>;

function DomainMenuItem({item, index}: DomainMenuItemProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Globe']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isAdmin, isValidated, action} = item;

    const threeDotsMenuItems: PopoverMenuItem[] | undefined = useMemo(
        () =>
            isAdmin
                ? [
                      {
                          icon: icons.Globe,
                          text: translate('domain.goToDomain'),
                          onSelected: action,
                      },
                      !isValidated && {
                          icon: icons.Globe,
                          text: translate('domain.verifyDomain.title'),
                          onSelected: () => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(item.accountID)),
                      },
                  ].filter((menuItem) => !!menuItem)
                : undefined,
        [isAdmin, icons.Globe, translate, action, isValidated, item.accountID],
    );

    return (
        <OfflineWithFeedback
            key={`domain_${item.title}_${index}`}
            pendingAction={item.pendingAction}
            style={styles.mb2}
        >
            <PressableWithoutFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel="row"
                style={styles.mh5}
                onPress={action}
            >
                {({hovered}) => (
                    <DomainsListRow
                        title={item.title}
                        badgeText={isAdmin && !isValidated ? translate('domain.notVerified') : undefined}
                        isHovered={hovered}
                        menuItems={threeDotsMenuItems}
                    />
                )}
            </PressableWithoutFeedback>
        </OfflineWithFeedback>
    );
}

export type {DomainItem};
export default DomainMenuItem;
