import {substituteRouteParameters} from '@libs/SidePaneUtils';

describe('substituteRouteParameters', () => {
    test('should substitute simple route parameters', () => {
        const route = '/workspaces/123/rules/456';
        const params = {workspaceID: '123', ruleID: '456'};
        expect(substituteRouteParameters(route, params)).toBe('/workspaces/:workspaceID/rules/:ruleID');
    });

    test('should handle routes with multiple occurrences of a parameter', () => {
        const route = '/reports/987/items/987';
        const params = {reportID: '987'};
        expect(substituteRouteParameters(route, params)).toBe('/reports/:reportID/items/:reportID');
    });

    test('should ignore non-matching parameters', () => {
        const route = '/settings/profile';
        const params = {userID: '123'};
        expect(substituteRouteParameters(route, params)).toBe('/settings/profile');
    });

    test('should work with nested objects in params', () => {
        const route = '/users/789/orders/456';
        const params = {user: {id: '789'}, order: {id: '456'}};
        expect(substituteRouteParameters(route, params)).toBe('/users/:id/orders/:id'); // Could be problematic with duplicate param names
    });

    test('should handle parameters that do not exist in the route', () => {
        const route = '/dashboard/overview';
        const params = {dashboardID: '111'};
        expect(substituteRouteParameters(route, params)).toBe('/dashboard/overview');
    });

    test('should handle routes with query parameters correctly', () => {
        const route = '/reports/555/view?filter=active';
        const params = {reportID: '555'};
        expect(substituteRouteParameters(route, params)).toBe('/reports/:reportID/view?filter=active');
    });

    test('should not replace partial parameter values', () => {
        const route = '/workspaces/123456/activities';
        const params = {workspaceID: '123'};
        expect(substituteRouteParameters(route, params)).toBe('/workspaces/123456/activities'); // '123' is a subset of '123456'
    });

    test('should return the original route if params is an empty object', () => {
        const route = '/users/42/profile';
        const params = {};
        expect(substituteRouteParameters(route, params)).toBe('/users/42/profile');
    });

    test('should return the original route if params are null or undefined', () => {
        const route = '/reports/23/details';
        expect(substituteRouteParameters(route, null as unknown as Record<string, unknown>)).toBe('/reports/23/details');
        expect(substituteRouteParameters(route, undefined as unknown as Record<string, unknown>)).toBe('/reports/23/details');
    });

    test('should properly replace overlapping values', () => {
        const route = '/reports/123/report/123/details';
        const params = {id: '123'};
        expect(substituteRouteParameters(route, params)).toBe('/reports/:id/report/:id/details');
    });

    test('should handle deeply nested parameters', () => {
        const route = '/company/789/employees/456/profile';
        const params = {company: {id: '789'}, employee: {id: '456'}};
        expect(substituteRouteParameters(route, params)).toBe('/company/:id/employees/:id/profile');
    });

    test('should prevent accidental replacements inside unrelated words', () => {
        const route = '/analysis/321/report321/details';
        const params = {reportID: '321'};
        expect(substituteRouteParameters(route, params)).toBe('/analysis/:reportID/report321/details');
    });
});
