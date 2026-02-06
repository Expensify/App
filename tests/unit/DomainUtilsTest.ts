import {hasDomainAdminsErrors, hasDomainAdminsSettingsErrors, hasDomainErrors, hasDomainMembersErrors} from '@libs/DomainUtils';
import type DomainErrors from '@src/types/onyx/DomainErrors';

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
    });
});
