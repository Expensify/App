import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import DomainsListRow from './DomainsListRow';

type DomainMenuItemProps = {item: DomainItem; index: number};

type DomainItem = {
    listItemType: 'domain';

    /** main text to show in the row  */
    title: string;

    /** function to run when clicking on the row  */
    action: () => void;

    /** id of the row's domain */
    accountID: number;

    /** whether the user is an admin of the row's domain */
    isAdmin: boolean;

    /** whether the row's domain is validated (aka verified) */
    isValidated: boolean;
} & Pick<OfflineWithFeedbackProps, 'pendingAction'>;

function DomainMenuItem({item, index}: DomainMenuItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const threeDotsMenuItems: PopoverMenuItem[] | undefined =
        !item.isValidated && item.isAdmin
            ? [
                  {
                      icon: Expensicons.Globe,
                      text: translate('domain.verifyDomain.title'),
                      onSelected: () => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(item.accountID)),
                  },
              ]
            : undefined;

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
                onPress={item.action}
                disabled={!item.isAdmin}
            >
                {({hovered}) => (
                    <DomainsListRow
                        title={item.title}
                        badgeText={item.isAdmin && !item.isValidated ? translate('domain.notVerified') : undefined}
                        isHovered={hovered}
                        menuItems={threeDotsMenuItems}
                    />
                )}
            </PressableWithoutFeedback>
        </OfflineWithFeedback>
    );
}

DomainMenuItem.displayName = 'DomainMenuItem';

export type {DomainItem};
export default DomainMenuItem;
