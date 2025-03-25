/**
 * This function is used to substitute the route parameters in the route string with the actual parameter names
 *
 * Example:
 * route: /workspaces/123/rules/456/777
 * params: {workspaceID: '123', ruleID: '456', reportID: '777'}
 * overrides: {reportID: 'expense'}
 * result: /workspaces/:workspaceID/rules/:ruleID/expense
 */
function substituteRouteParameters(route: string, params: Record<string, unknown>, overrides?: Record<string, string | undefined>): string {
    let updatedRoute = route;

    function searchAndReplace(obj: Record<string, unknown>) {
        for (const key in obj) {
            if (key === 'path') {
                // eslint-disable-next-line no-continue
                continue;
            }

            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                searchAndReplace(value as Record<string, unknown>);
            } else if (typeof value === 'string') {
                const keyOverride = overrides?.[key];
                const regex = new RegExp(`\\b${value}\\b`, 'g');
                updatedRoute = updatedRoute.replace(regex, keyOverride ?? `:${key}`);
            }
        }
    }

    searchAndReplace(params);
    return updatedRoute;
}

// eslint-disable-next-line import/prefer-default-export
export {substituteRouteParameters};
