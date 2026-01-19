import type {NavigationState} from '@react-navigation/native';
import {clearGuards, createGuardContext, evaluateGuards, getRegisteredGuards, registerGuard} from '@libs/Navigation/guards';
import type {GuardContext, NavigationGuard} from '@libs/Navigation/guards/types';
import ROUTES from '@src/ROUTES';

describe('Navigation Guard System', () => {
    beforeEach(() => {
        // Clear all guards before each test
        clearGuards();
    });

    describe('registerGuard', () => {
        it('should register a guard', () => {
            const mockGuard: NavigationGuard = {
                name: 'TestGuard',
                shouldApply: () => true,
                evaluate: () => ({type: 'ALLOW'}),
            };

            registerGuard(mockGuard);

            expect(getRegisteredGuards()).toHaveLength(1);
            expect(getRegisteredGuards().at(0)).toBe(mockGuard);
        });

        it('should register multiple guards in order', () => {
            const guard1: NavigationGuard = {
                name: 'Guard1',
                shouldApply: () => true,
                evaluate: () => ({type: 'ALLOW'}),
            };
            const guard2: NavigationGuard = {
                name: 'Guard2',
                shouldApply: () => true,
                evaluate: () => ({type: 'ALLOW'}),
            };

            registerGuard(guard1);
            registerGuard(guard2);

            const guards = getRegisteredGuards();
            expect(guards).toHaveLength(2);
            expect(guards.at(0)?.name).toBe('Guard1');
            expect(guards.at(1)?.name).toBe('Guard2');
        });
    });

    describe('clearGuards', () => {
        it('should remove all registered guards', () => {
            const mockGuard: NavigationGuard = {
                name: 'TestGuard',
                shouldApply: () => true,
                evaluate: () => ({type: 'ALLOW'}),
            };

            registerGuard(mockGuard);
            expect(getRegisteredGuards()).toHaveLength(1);

            clearGuards();
            expect(getRegisteredGuards()).toHaveLength(0);
        });
    });

    describe('createGuardContext', () => {
        it('should create a guard context with expected properties', () => {
            const context = createGuardContext();

            expect(context).toHaveProperty('isAuthenticated');
            expect(context).toHaveProperty('isLoading');
            expect(context).toHaveProperty('currentUrl');
            expect(typeof context.isAuthenticated).toBe('boolean');
            expect(typeof context.isLoading).toBe('boolean');
            expect(typeof context.currentUrl).toBe('string');
        });
    });

    describe('evaluateGuards', () => {
        const mockState = {
            key: 'test-key',
            index: 0,
            routeNames: [],
            routes: [],
            type: 'test',
            stale: false,
        } as NavigationState;
        const mockAction = {type: 'NAVIGATE', payload: {name: 'TestScreen'}} as const;
        const mockContext: GuardContext = {
            isAuthenticated: true,
            isLoading: false,
            currentUrl: '',
        };

        it('should return ALLOW when no guards are registered', () => {
            const result = evaluateGuards(mockState, mockAction, mockContext);
            expect(result).toEqual({type: 'ALLOW'});
        });

        it('should skip guards where shouldApply returns false', () => {
            const evaluateFn = jest.fn(() => ({type: 'ALLOW' as const}));
            const mockGuard: NavigationGuard = {
                name: 'TestGuard',
                shouldApply: () => false,
                evaluate: evaluateFn,
            };

            registerGuard(mockGuard);
            const result = evaluateGuards(mockState, mockAction, mockContext);

            expect(result).toEqual({type: 'ALLOW'});
            expect(evaluateFn).not.toHaveBeenCalled();
        });

        it('should evaluate guards where shouldApply returns true', () => {
            const evaluateFn = jest.fn(() => ({type: 'ALLOW' as const}));
            const mockGuard: NavigationGuard = {
                name: 'TestGuard',
                shouldApply: () => true,
                evaluate: evaluateFn,
            };

            registerGuard(mockGuard);
            evaluateGuards(mockState, mockAction, mockContext);

            expect(evaluateFn).toHaveBeenCalledWith(mockState, mockAction, mockContext);
        });

        it('should short-circuit on BLOCK result', () => {
            const guard1Evaluate = jest.fn(() => ({type: 'BLOCK' as const, reason: 'Blocked'}));
            const guard2Evaluate = jest.fn(() => ({type: 'ALLOW' as const}));

            const guard1: NavigationGuard = {
                name: 'BlockingGuard',
                shouldApply: () => true,
                evaluate: guard1Evaluate,
            };
            const guard2: NavigationGuard = {
                name: 'AllowGuard',
                shouldApply: () => true,
                evaluate: guard2Evaluate,
            };

            registerGuard(guard1);
            registerGuard(guard2);

            const result = evaluateGuards(mockState, mockAction, mockContext);

            expect(result).toEqual({type: 'BLOCK', reason: 'Blocked'});
            expect(guard1Evaluate).toHaveBeenCalled();
            expect(guard2Evaluate).not.toHaveBeenCalled();
        });

        it('should short-circuit on REDIRECT result', () => {
            const guard1Evaluate = jest.fn(() => ({type: 'REDIRECT' as const, route: ROUTES.HOME}));
            const guard2Evaluate = jest.fn(() => ({type: 'ALLOW' as const}));

            const guard1: NavigationGuard = {
                name: 'RedirectGuard',
                shouldApply: () => true,
                evaluate: guard1Evaluate,
            };
            const guard2: NavigationGuard = {
                name: 'AllowGuard',
                shouldApply: () => true,
                evaluate: guard2Evaluate,
            };

            registerGuard(guard1);
            registerGuard(guard2);

            const result = evaluateGuards(mockState, mockAction, mockContext);

            expect(result).toEqual({type: 'REDIRECT', route: ROUTES.HOME});
            expect(guard1Evaluate).toHaveBeenCalled();
            expect(guard2Evaluate).not.toHaveBeenCalled();
        });

        it('should continue evaluation when guard returns ALLOW', () => {
            const guard1Evaluate = jest.fn(() => ({type: 'ALLOW' as const}));
            const guard2Evaluate = jest.fn(() => ({type: 'ALLOW' as const}));

            const guard1: NavigationGuard = {
                name: 'AllowGuard1',
                shouldApply: () => true,
                evaluate: guard1Evaluate,
            };
            const guard2: NavigationGuard = {
                name: 'AllowGuard2',
                shouldApply: () => true,
                evaluate: guard2Evaluate,
            };

            registerGuard(guard1);
            registerGuard(guard2);

            const result = evaluateGuards(mockState, mockAction, mockContext);

            expect(result).toEqual({type: 'ALLOW'});
            expect(guard1Evaluate).toHaveBeenCalled();
            expect(guard2Evaluate).toHaveBeenCalled();
        });

        it('should evaluate guards in registration order', () => {
            const executionOrder: string[] = [];

            const guard1: NavigationGuard = {
                name: 'Guard1',
                shouldApply: () => true,
                evaluate: () => {
                    executionOrder.push('Guard1');
                    return {type: 'ALLOW'};
                },
            };
            const guard2: NavigationGuard = {
                name: 'Guard2',
                shouldApply: () => true,
                evaluate: () => {
                    executionOrder.push('Guard2');
                    return {type: 'ALLOW'};
                },
            };
            const guard3: NavigationGuard = {
                name: 'Guard3',
                shouldApply: () => true,
                evaluate: () => {
                    executionOrder.push('Guard3');
                    return {type: 'ALLOW'};
                },
            };

            registerGuard(guard1);
            registerGuard(guard2);
            registerGuard(guard3);

            evaluateGuards(mockState, mockAction, mockContext);

            expect(executionOrder).toEqual(['Guard1', 'Guard2', 'Guard3']);
        });
    });
});
