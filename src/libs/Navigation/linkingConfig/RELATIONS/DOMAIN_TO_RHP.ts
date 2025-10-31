import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// This file is used to define relation between domain split navigator's central screens and RHP screens.
const DOMAIN_TO_RHP: Partial<Record<keyof DomainSplitNavigatorParamList, string[]>> = {
    [SCREENS.DOMAIN.INITIAL]: [],
    [SCREENS.DOMAIN.SAML]: [SCREENS.DOMAIN.VERIFY, SCREENS.DOMAIN.VERIFIED],
};

export default DOMAIN_TO_RHP;
