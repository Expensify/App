import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// This file is used to define relation between domain split navigator's central screens and RHP screens.
const DOMAIN_TO_RHP: Partial<Record<keyof DomainSplitNavigatorParamList, string[]>> = {
    [SCREENS.DOMAIN.INITIAL]: [],
    [SCREENS.DOMAIN.SAML]: [SCREENS.DOMAIN.VERIFY, SCREENS.DOMAIN.VERIFIED],
    [SCREENS.DOMAIN.ADMINS]: [SCREENS.DOMAIN.ADMIN_DETAILS, SCREENS.DOMAIN.ADMINS_SETTINGS, SCREENS.DOMAIN.ADD_PRIMARY_CONTACT, SCREENS.DOMAIN.ADD_ADMIN, SCREENS.DOMAIN.RESET_DOMAIN],
    [SCREENS.DOMAIN.MEMBERS]: [SCREENS.DOMAIN.MEMBER_DETAILS, SCREENS.DOMAIN.ADD_MEMBER, SCREENS.DOMAIN.VACATION_DELEGATE],
};

export default DOMAIN_TO_RHP;
