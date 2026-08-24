import getDomainMenuItems from '@pages/domain/getDomainMenuItems';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type IconAsset from '@src/types/utils/IconAsset';

const domainAccountID = 123;
const adminAccountID = 1;
const mockIcon: IconAsset = () => null;
const icons = {
    User: mockIcon,
    UserShield: mockIcon,
    Users: mockIcon,
    UserLock: mockIcon,
};

describe('getDomainMenuItems', () => {
    it('preserves the Domain menu order, routes, and icons', () => {
        const items = getDomainMenuItems({domainAccountID, icons});

        expect(items.map((item) => item.translationKey)).toEqual(['domain.domainMembers', 'domain.domainAdmins', 'domain.groups.title', 'domain.saml']);
        expect(items.map((item) => item.route)).toEqual([
            ROUTES.DOMAIN_MEMBERS.getRoute(domainAccountID),
            ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID),
            ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID),
            ROUTES.DOMAIN_SAML.getRoute(domainAccountID),
        ]);
        expect(items.map((item) => item.icon)).toEqual([icons.User, icons.UserShield, icons.Users, icons.UserLock]);
        expect(items.map((item) => item.screenName)).toEqual([SCREENS.DOMAIN.MEMBERS, SCREENS.DOMAIN.ADMINS, SCREENS.DOMAIN.GROUPS, SCREENS.DOMAIN.SAML]);
        expect(items.every((item) => item.brickRoadIndicator === undefined)).toBe(true);
    });

    const securityGroupErrorKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1` as const;
    const groupErrors: DomainErrors = {
        errors: {},
        [securityGroupErrorKey]: {errors: {groupError: 'Group error'}},
    };

    it.each([
        ['Members', {errors: {}, memberErrors: {member: {errors: {memberError: 'Member error'}}}}, 'domain.domainMembers'],
        ['Admins', {errors: {}, adminErrors: {[adminAccountID]: {errors: {adminError: 'Admin error'}}}}, 'domain.domainAdmins'],
        ['Groups', groupErrors, 'domain.groups.title'],
    ] satisfies Array<[string, DomainErrors, string]>)('preserves the %s error indicator', (_name, domainErrors, expectedTranslationKey) => {
        const items = getDomainMenuItems({domainAccountID, domainErrors, icons});

        expect(items.filter((item) => item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR).map((item) => item.translationKey)).toEqual([expectedTranslationKey]);
    });

    it('shows indicators on every erroring Domain section at once', () => {
        const domainErrors: DomainErrors = {
            ...groupErrors,
            memberErrors: {member: {errors: {memberError: 'Member error'}}},
            adminErrors: {[adminAccountID]: {errors: {adminError: 'Admin error'}}},
        };
        const items = getDomainMenuItems({domainAccountID, domainErrors, icons});

        expect(items.filter((item) => item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR).map((item) => item.translationKey)).toEqual([
            'domain.domainMembers',
            'domain.domainAdmins',
            'domain.groups.title',
        ]);
    });

    it('does not show an error indicator on the SAML item when another Domain item has errors', () => {
        const domainErrors: DomainErrors = {errors: {}, memberErrors: {member: {errors: {memberError: 'Member error'}}}};
        const items = getDomainMenuItems({domainAccountID, domainErrors, icons});

        expect(items.find((item) => item.translationKey === 'domain.saml')?.brickRoadIndicator).toBeUndefined();
    });
});
