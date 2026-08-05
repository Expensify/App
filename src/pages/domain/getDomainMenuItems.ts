/**
 * Builds the ordered Domain menu items with their routes and indicator states.
 */
import {hasDomainAdminsErrors, hasDomainGroupsErrors, hasDomainMembersErrors} from '@libs/DomainUtils';

import type DOMAIN_TO_RHP from '@navigation/linkingConfig/RELATIONS/DOMAIN_TO_RHP';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

type DomainTopLevelScreens = keyof typeof DOMAIN_TO_RHP;

type DomainMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    route: Route;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: DomainTopLevelScreens;
};

type DomainMenuIconMap = Record<'User' | 'UserShield' | 'Users' | 'UserLock', IconAsset>;

type GetDomainMenuItemsParams = {
    domainAccountID: number;
    domainErrors?: DomainErrors;
    icons: DomainMenuIconMap;
};

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
