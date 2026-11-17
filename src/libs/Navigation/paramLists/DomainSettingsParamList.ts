import type SCREENS from '@src/SCREENS';

type DomainSettingsParamList = {
    [SCREENS.DOMAIN.SAML_VERIFY]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.SAML_VERIFIED]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS_VERIFY]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS_VERIFIED]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADMIN_DETAILS]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.ADMINS_SETTINGS]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADD_PRIMARY_CONTACT]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADD_ADMIN]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_DETAILS]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.ADD_MEMBER]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS_SETTINGS]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS_SETTINGS_TWO_FACTOR_AUTH]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.VACATION_DELEGATE]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.VACATION_DELEGATE_SELECT]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_FORCE_TWO_FACTOR_AUTH]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_RESET_TWO_FACTOR_AUTH]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_LOCK_ACCOUNT]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS_MOVE_TO_GROUP]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_MOVE_TO_GROUP]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.GROUP_DETAILS]: {
        domainAccountID: number;
        groupID: string;
    };
    [SCREENS.DOMAIN.GROUP_EDIT_NAME]: {
        domainAccountID: number;
        groupID: string;
    };
    [SCREENS.DOMAIN.SECURITY_GROUPS_PREFERRED_WORKSPACE]: {
        domainAccountID: number;
        groupID: string;
    };
    [SCREENS.DOMAIN.GROUP_CREATE]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.GROUP_CREATE_PREFERRED_WORKSPACE]: {
        domainAccountID: number;
    };
};

export default DomainSettingsParamList;
