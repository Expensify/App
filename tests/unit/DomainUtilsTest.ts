import {getMemberCustomRowProps, hasDomainAdminsErrors, hasDomainAdminsSettingsErrors, hasDomainErrors, hasDomainMembersErrors, hasDomainMembersSettingsErrors} from '@libs/DomainUtils';
import CONST from '@src/CONST';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type DomainPendingAction from '@src/types/onyx/DomainPendingActions';

const adminID = 1;
describe('DomainUtils', () => {
    describe('hasDomainErrors', () => {
        it('should return false when domainErrors is undefined', () => {
            expect(hasDomainErrors(undefined)).toBe(false);
        });

        it('should return false when there are no errors', () => {
            const domainErrors: DomainErrors = {errors: {}};
            expect(hasDomainErrors(domainErrors)).toBe(false);
        });

        it('should return true when there are top-level domain errors', () => {
            const domainErrors: DomainErrors = {errors: {timestamp1: 'Something went wrong'}};
            expect(hasDomainErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are admin errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                adminErrors: {[adminID]: {errors: {timestamp1: 'Admin error'}}},
            };
            expect(hasDomainErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are member errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {user1: {errors: {timestamp1: 'Member error'}}},
            };
            expect(hasDomainErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are technical contact email errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                technicalContactEmailErrors: {timestamp1: 'Invalid email'},
            };
            expect(hasDomainErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are billing card errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                useTechnicalContactBillingCardErrors: {timestamp1: 'Card error'},
            };
            expect(hasDomainErrors(domainErrors)).toBe(true);
        });
    });

    describe('hasDomainAdminsErrors', () => {
        it('should return false when domainErrors is undefined', () => {
            expect(hasDomainAdminsErrors(undefined)).toBe(false);
        });

        it('should return false when there are no admin errors', () => {
            const domainErrors: DomainErrors = {errors: {}};
            expect(hasDomainAdminsErrors(domainErrors)).toBe(false);
        });

        it('should return false when adminErrors exist but have no errors inside', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                adminErrors: {[adminID]: {errors: {}}},
            };
            expect(hasDomainAdminsErrors(domainErrors)).toBe(false);
        });

        it('should return true when an admin has errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                adminErrors: {[adminID]: {errors: {timestamp1: 'Admin error'}}},
            };
            expect(hasDomainAdminsErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are technical contact email errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                technicalContactEmailErrors: {timestamp1: 'Invalid email'},
            };
            expect(hasDomainAdminsErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are billing card errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                useTechnicalContactBillingCardErrors: {timestamp1: 'Card error'},
            };
            expect(hasDomainAdminsErrors(domainErrors)).toBe(true);
        });

        it('should return true when admin has no errors but settings have errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                adminErrors: {[adminID]: {errors: {}}},
                technicalContactEmailErrors: {timestamp1: 'Invalid email'},
            };
            expect(hasDomainAdminsErrors(domainErrors)).toBe(true);
        });
    });

    describe('hasDomainAdminsSettingsErrors', () => {
        it('should return false when domainErrors is undefined', () => {
            expect(hasDomainAdminsSettingsErrors(undefined)).toBe(false);
        });

        it('should return false when there are no settings errors', () => {
            const domainErrors: DomainErrors = {errors: {}};
            expect(hasDomainAdminsSettingsErrors(domainErrors)).toBe(false);
        });

        it('should return true when there are technical contact email errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                technicalContactEmailErrors: {timestamp1: 'Invalid email'},
            };
            expect(hasDomainAdminsSettingsErrors(domainErrors)).toBe(true);
        });

        it('should return true when there are billing card errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                useTechnicalContactBillingCardErrors: {timestamp1: 'Card error'},
            };
            expect(hasDomainAdminsSettingsErrors(domainErrors)).toBe(true);
        });

        it('should return true when both settings errors exist', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                technicalContactEmailErrors: {timestamp1: 'Invalid email'},
                useTechnicalContactBillingCardErrors: {timestamp2: 'Card error'},
            };
            expect(hasDomainAdminsSettingsErrors(domainErrors)).toBe(true);
        });

        it('should return false when settings error objects are empty', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                technicalContactEmailErrors: {},
                useTechnicalContactBillingCardErrors: {},
            };
            expect(hasDomainAdminsSettingsErrors(domainErrors)).toBe(false);
        });
    });

    describe('hasDomainMembersErrors', () => {
        it('should return false when domainErrors is undefined', () => {
            expect(hasDomainMembersErrors(undefined)).toBe(false);
        });

        it('should return false when there are no member errors', () => {
            const domainErrors: DomainErrors = {errors: {}};
            expect(hasDomainMembersErrors(domainErrors)).toBe(false);
        });

        it('should return false when memberErrors exist but have no errors inside', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {user1: {errors: {}}},
            };
            expect(hasDomainMembersErrors(domainErrors)).toBe(false);
        });

        it('should return true when a member has errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {user1: {errors: {timestamp1: 'Member error'}}},
            };
            expect(hasDomainMembersErrors(domainErrors)).toBe(true);
        });

        it('should return true when at least one member has errors among multiple', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    user1: {errors: {}},
                    user2: {errors: {timestamp1: 'Member error'}},
                },
            };
            expect(hasDomainMembersErrors(domainErrors)).toBe(true);
        });

        it('should return false when all members have empty errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    user1: {errors: {}},
                    user2: {errors: {}},
                },
            };
            expect(hasDomainMembersErrors(domainErrors)).toBe(false);
        });

        it('should return true when there are members settings errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                setTwoFactorAuthRequiredError: {timestamp1: '2FA toggle error'},
            };
            expect(hasDomainMembersErrors(domainErrors)).toBe(true);
        });
    });

    describe('hasDomainMembersSettingsErrors', () => {
        it('should return false when domainErrors is undefined', () => {
            expect(hasDomainMembersSettingsErrors(undefined)).toBe(false);
        });

        it('should return false when there are no settings errors', () => {
            const domainErrors: DomainErrors = {errors: {}};
            expect(hasDomainMembersSettingsErrors(domainErrors)).toBe(false);
        });

        it('should return true when there are two factor auth required errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                setTwoFactorAuthRequiredError: {timestamp1: '2FA toggle error'},
            };
            expect(hasDomainMembersSettingsErrors(domainErrors)).toBe(true);
        });

        it('should return false when setTwoFactorAuthRequiredError is empty', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                setTwoFactorAuthRequiredError: {},
            };
            expect(hasDomainMembersSettingsErrors(domainErrors)).toBe(false);
        });
    });

    describe('getMemberCustomRowProps', () => {
        const accountID = 42;
        const email = 'user@example.com';
        const EARLY_TIMESTAMP = 1742000000000000;
        const LATE_TIMESTAMP = 1742000001000000;

        it('should return empty errors and no pendingAction when both are undefined', () => {
            const result = getMemberCustomRowProps(accountID, undefined, undefined);
            expect(result.errors).toEqual({});
            expect(result.pendingAction).toBeUndefined();
            expect(result.brickRoadIndicator).toBeUndefined();
        });

        it('should return pendingAction from email key', () => {
            const domainPendingActions: DomainPendingAction['member'] = {
                [email]: {pendingAction: 'add', lockAccount: undefined, changeDomainSecurityGroup: undefined},
            };
            const result = getMemberCustomRowProps(accountID, domainPendingActions, undefined, email);
            expect(result.pendingAction).toBe('add');
        });

        it('should return pendingAction from accountID key when no email key exists', () => {
            const domainPendingActions: DomainPendingAction['member'] = {
                [accountID]: {pendingAction: 'update', lockAccount: undefined, changeDomainSecurityGroup: undefined},
            };
            const result = getMemberCustomRowProps(accountID, domainPendingActions, undefined);
            expect(result.pendingAction).toBe('update');
        });

        it('should fall back to lockAccount pending action when accountID pendingAction is undefined', () => {
            const domainPendingActions: DomainPendingAction['member'] = {
                [accountID]: {pendingAction: undefined, lockAccount: 'update', changeDomainSecurityGroup: undefined},
            };
            const result = getMemberCustomRowProps(accountID, domainPendingActions, undefined);
            expect(result.pendingAction).toBe('update');
        });

        it('should prefer email pendingAction over accountID pendingAction', () => {
            const domainPendingActions: DomainPendingAction['member'] = {
                [email]: {pendingAction: 'add', lockAccount: undefined, changeDomainSecurityGroup: undefined},
                [accountID]: {pendingAction: 'delete', lockAccount: undefined, changeDomainSecurityGroup: undefined},
            };
            const result = getMemberCustomRowProps(accountID, domainPendingActions, undefined, email);
            expect(result.pendingAction).toBe('add');
        });

        it('should return errors from accountID memberErrors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [accountID]: {errors: {[EARLY_TIMESTAMP]: 'Account error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors);
            expect(result.errors).toEqual({[EARLY_TIMESTAMP]: 'Account error'});
        });

        it('should return errors from email memberErrors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [email]: {errors: {[EARLY_TIMESTAMP]: 'Email error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors, email);
            expect(result.errors).toEqual({[EARLY_TIMESTAMP]: 'Email error'});
        });

        it('should return the latest error key after merging accountID and email errors', () => {
            // getLatestError picks the lexicographically latest key from merged errors
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [accountID]: {errors: {[EARLY_TIMESTAMP]: 'Account error'}, changeDomainSecurityGroupErrors: {}},
                    [email]: {errors: {[LATE_TIMESTAMP]: 'Email error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors, email);
            // LATE_TIMESTAMP > EARLY_TIMESTAMP, so email error wins
            expect(result.errors).toEqual({[LATE_TIMESTAMP]: 'Email error'});
        });

        it('should include lockAccountErrors in merged errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [accountID]: {errors: {}, lockAccountErrors: {[EARLY_TIMESTAMP]: 'Lock error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors);
            expect(result.errors).toEqual({[EARLY_TIMESTAMP]: 'Lock error'});
        });

        it('should set brickRoadIndicator to ERROR when vacationDelegateErrors exist', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [email]: {errors: {}, vacationDelegateErrors: {[EARLY_TIMESTAMP]: 'Delegate error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors, email);
            expect(result.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should set brickRoadIndicator to ERROR when twoFactorAuthExemptEmailsError exist', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [email]: {errors: {}, twoFactorAuthExemptEmailsError: {[EARLY_TIMESTAMP]: '2FA error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors, email);
            expect(result.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should surface changeDomainSecurityGroupErrors in result errors (not brickRoadIndicator)', () => {
            // changeDomainSecurityGroupErrors are merged into base errors, not tracked as a separate field
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [accountID]: {errors: {}, changeDomainSecurityGroupErrors: {[EARLY_TIMESTAMP]: 'Group error'}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors);
            expect(result.errors).toEqual({[EARLY_TIMESTAMP]: 'Group error'});
            expect(result.brickRoadIndicator).toBeUndefined();
        });

        it('should leave brickRoadIndicator undefined when there are only base errors', () => {
            const domainErrors: DomainErrors = {
                errors: {},
                memberErrors: {
                    [accountID]: {errors: {[EARLY_TIMESTAMP]: 'Some error'}, changeDomainSecurityGroupErrors: {}},
                },
            };
            const result = getMemberCustomRowProps(accountID, undefined, domainErrors);
            expect(result.brickRoadIndicator).toBeUndefined();
        });
    });
});
