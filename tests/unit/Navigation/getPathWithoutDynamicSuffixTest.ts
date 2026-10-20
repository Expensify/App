import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

describe('getPathWithoutDynamicSuffix', () => {
    const categorySuffix = DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.path;
    const addCategorySuffix = DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.path;
    const categoryQuery = 'action=create&iouType=submit&transactionID=t1&reportID=r1';

    it('keeps the query params the dynamic route underneath also declares', () => {
        // Given the add-category page stacked on the category list in the share flow, where the list's only source of its
        // transaction is the query string, and both routes declare the same param names
        const path = `share/submit-details/123/${categorySuffix}/${addCategorySuffix}?${categoryQuery}`;

        // When the add-category suffix is stripped to build the back path
        const backPath = getPathWithoutDynamicSuffix(path, addCategorySuffix);

        // Then the shared params stay for the category list, so going back lands on it instead of a "Not here" page
        expect(backPath).toBe(`share/submit-details/123/${categorySuffix}?${categoryQuery}`);
    });

    it('gives a back path the category list is rebuilt from with its transaction', () => {
        // Given the back path of the add-category page in the share flow
        const backPath = getPathWithoutDynamicSuffix(`share/submit-details/123/${categorySuffix}/${addCategorySuffix}?${categoryQuery}`, addCategorySuffix);

        // When navigation parses it, as going back does to find the screen to return to
        const focusedRoute = findFocusedRoute(getStateFromPath(backPath));

        // Then it is the category list with its transaction, which the share flow passes only through the query string
        expect(focusedRoute?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY);
        expect(focusedRoute?.params).toMatchObject({action: 'create', iouType: 'submit', transactionID: 't1', reportID: 'r1'});
    });

    it('strips the query params of the suffix when no dynamic route is left underneath', () => {
        // Given the category list stacked directly on the share details page, which has no query params of its own
        const path = `share/submit-details/123/${categorySuffix}?${categoryQuery}`;

        // When the category suffix is stripped
        const backPath = getPathWithoutDynamicSuffix(path, categorySuffix);

        // Then the list's params go with it, as they are nothing to the share details page
        expect(backPath).toBe('share/submit-details/123');
    });

    it('strips a shared query param when the match underneath is not a screen the stripped route opens from', () => {
        // Given a profile opened from the settings of a category named "downgrade", with the profile's own `policyID`. The
        // base path only looks like it ends in the workspace downgrade route, which declares `policyID` too
        const profileSuffix = DYNAMIC_ROUTES.PROFILE.path;
        const path = `workspaces/A/categories/${DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.path.replace(':categoryName', 'downgrade')}/a/123?policyID=B`;

        // When the profile suffix is stripped
        const backPath = getPathWithoutDynamicSuffix(path, 'a/123', profileSuffix);

        // Then `policyID` goes with it: the profile opens from anywhere, which vouches for no particular route underneath,
        // so the category settings are not rebuilt with another workspace's policy
        expect(backPath).toBe('workspaces/A/categories/category/downgrade');
    });

    it('keeps the query params that belong to neither route', () => {
        // Given the add-category page stacked on the category list, with an unrelated query param on the URL
        const path = `share/submit-details/123/${categorySuffix}/${addCategorySuffix}?${categoryQuery}&foo=bar`;

        // When the add-category suffix is stripped
        const backPath = getPathWithoutDynamicSuffix(path, addCategorySuffix);

        // Then that param is untouched, next to the ones kept for the category list
        expect(backPath).toBe(`share/submit-details/123/${categorySuffix}?${categoryQuery}&foo=bar`);
    });
});
