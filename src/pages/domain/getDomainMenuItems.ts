import type DOMAIN_TO_RHP from '@navigation/linkingConfig/RELATIONS/DOMAIN_TO_RHP';

import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';

type DomainTopLevelScreens = keyof typeof DOMAIN_TO_RHP;

type DomainMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    getRoute: (domainAccountID: number) => Route;
    key: string;
    screenName: DomainTopLevelScreens;
};

type DomainMenuIconMap = Record<'User' | 'UserShield' | 'Users' | 'UserLock', IconAsset>;

function getDomainMenuItems({icons}: {icons: DomainMenuIconMap}): DomainMenuItem[] {
    return [
        {
            translationKey: 'domain.domainMembers',
            icon: icons.User,
            getRoute: ROUTES.DOMAIN_MEMBERS.getRoute,
            key: 'members',
            screenName: SCREENS.DOMAIN.MEMBERS,
        },
        {
            translationKey: 'domain.domainAdmins',
            icon: icons.UserShield,
            getRoute: ROUTES.DOMAIN_ADMINS.getRoute,
            key: 'admins',
            screenName: SCREENS.DOMAIN.ADMINS,
        },
        {
            translationKey: 'domain.groups.title',
            icon: icons.Users,
            getRoute: ROUTES.DOMAIN_GROUPS.getRoute,
            key: 'groups',
            screenName: SCREENS.DOMAIN.GROUPS,
        },
        {
            translationKey: 'domain.saml',
            icon: icons.UserLock,
            getRoute: ROUTES.DOMAIN_SAML.getRoute,
            key: 'saml',
            screenName: SCREENS.DOMAIN.SAML,
        },
    ];
}

export default getDomainMenuItems;
export type {DomainMenuItem, DomainMenuIconMap};
