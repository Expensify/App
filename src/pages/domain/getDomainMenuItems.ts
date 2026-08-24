import {hasDomainAdminsErrors, hasDomainGroupsErrors, hasDomainMembersErrors} from '@libs/DomainUtils';

import type DOMAIN_TO_RHP from '@navigation/linkingConfig/RELATIONS/DOMAIN_TO_RHP';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type IconAsset from '@src/types/utils/IconAsset';

import type {TupleToUnion, ValueOf} from 'type-fest';

const DOMAIN_MENU_ICON_NAMES = ['UserLock', 'UserShield', 'User', 'Users'] as const;

type DomainTopLevelScreens = keyof typeof DOMAIN_TO_RHP;

type DomainMenuItem = {
    /** Translation key used as the menu item label. */
    translationKey: TranslationPaths;

    /** Icon displayed next to the menu item label. */
    icon: IconAsset;

    /** Route opened when the menu item is selected. */
    route: Route;

    /** Error indicator for the corresponding Domain section. */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Screen used to determine whether the menu item is focused. */
    screenName: DomainTopLevelScreens;
};

type DomainMenuIconMap = Record<TupleToUnion<typeof DOMAIN_MENU_ICON_NAMES>, IconAsset>;

type GetDomainMenuItemsParams = {
    /** Account ID of the Domain whose routes are being built. */
    domainAccountID: number;

    /** Errors used to show indicators on the affected Domain sections. */
    domainErrors?: DomainErrors;

    /** Icons used by the Domain menu items. */
    icons: DomainMenuIconMap;
};

/**
 * Menu order is significant because it controls the on-screen layout. Callers attach navigation actions so those actions can retain page-specific lifecycle handling.
 */
function getDomainMenuItems({domainAccountID, domainErrors, icons}: GetDomainMenuItemsParams): DomainMenuItem[] {
    return [
        {
            translationKey: 'domain.domainMembers',
            icon: icons.User,
            route: ROUTES.DOMAIN_MEMBERS.getRoute(domainAccountID),
            screenName: SCREENS.DOMAIN.MEMBERS,
            brickRoadIndicator: hasDomainMembersErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            translationKey: 'domain.domainAdmins',
            icon: icons.UserShield,
            route: ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID),
            screenName: SCREENS.DOMAIN.ADMINS,
            brickRoadIndicator: hasDomainAdminsErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            translationKey: 'domain.groups.title',
            icon: icons.Users,
            route: ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID),
            screenName: SCREENS.DOMAIN.GROUPS,
            brickRoadIndicator: hasDomainGroupsErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            translationKey: 'domain.saml',
            icon: icons.UserLock,
            route: ROUTES.DOMAIN_SAML.getRoute(domainAccountID),
            screenName: SCREENS.DOMAIN.SAML,
        },
    ];
}

export default getDomainMenuItems;
export {DOMAIN_MENU_ICON_NAMES};
