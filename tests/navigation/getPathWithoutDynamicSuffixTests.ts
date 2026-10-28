import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

describe('getPathWithoutDynamicSuffix', () => {
    it('should remove a single-segment suffix from a simple path', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account', 'verify-account');

        expect(result).toBe('/settings/wallet');
    });

    it('should preserve query params after removing the suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account?param=value&other=1', 'verify-account');

        expect(result).toBe('/settings/wallet?param=value&other=1');
    });

    it('should remove a multi-segment suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country', 'address/country');

        expect(result).toBe('/settings/profile');
    });

    it('should return root path when suffix covers the entire path', () => {
        const result = getPathWithoutDynamicSuffix('/verify-account', 'verify-account');

        expect(result).toBe('');
    });

    it('should handle path without query params and not append question mark', () => {
        const result = getPathWithoutDynamicSuffix('/reports/details', 'details');

        expect(result).toBe('/reports');
    });

    it('should handle path with trailing slash before stripping suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account/', 'verify-account');

        expect(result).toBe('/settings/wallet');
    });

    it('should strip suffix-specific query params derived from DYNAMIC_ROUTES.getRoute', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country?country=US', 'country');

        expect(result).toBe('/settings/profile/address');
    });

    it('should strip only suffix-specific params and preserve base path params', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country?baseParam=1&country=US', 'country');

        expect(result).toBe('/settings/profile/address?baseParam=1');
    });

    it('should strip parametric suffix by actual value length', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/flag/456/abc', 'flag/456/abc');

        expect(result).toBe('/r/123');
    });

    it('should strip single-param suffix', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/members/member-details/456', 'member-details/456');

        expect(result).toBe('/r/123/members');
    });

    it('should strip parametric suffix and preserve query params', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/flag/456/abc?tab=details', 'flag/456/abc');

        expect(result).toBe('/r/123?tab=details');
    });

    it('should return empty when parametric suffix covers entire path', () => {
        const result = getPathWithoutDynamicSuffix('/flag/123/abc', 'flag/123/abc');

        expect(result).toBe('');
    });

    describe('tag GL code routes preserve parentTagsFilter on the settings path', () => {
        it('preserves parentTagsFilter when stripping workspace-tag-gl-code', () => {
            const result = getPathWithoutDynamicSuffix('/workspaces/p123/tags/workspace-tag-settings/1/North/workspace-tag-gl-code?parentTagsFilter=%5EFlorida%24', 'workspace-tag-gl-code');

            expect(result).toBe('/workspaces/p123/tags/workspace-tag-settings/1/North?parentTagsFilter=%5EFlorida%24');
        });

        it('preserves parentTagsFilter when stripping settings gl-code suffix', () => {
            const result = getPathWithoutDynamicSuffix(
                '/settings/p123/tags/tag-settings/1/North/gl-code/1/North?parentTagsFilter=%5EFlorida%24',
                'gl-code/1/North',
                'gl-code/:orderWeight/:tagName',
            );

            expect(result).toBe('/settings/p123/tags/tag-settings/1/North?parentTagsFilter=%5EFlorida%24');
        });
    });

    describe('actualSuffix shorter than registered pattern (optional absent)', () => {
        it('strips only the actualSuffix length when trailing optional is absent', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page', 'opt-page', 'opt-page/:id?');

            expect(result).toBe('/r/123');
        });

        it('strips actualSuffix when middle optional is absent', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/wrap/end', 'wrap/end', 'wrap/:p?/end');

            expect(result).toBe('/r/123');
        });

        it('preserves query params when stripping shorter actualSuffix', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page?baseParam=1', 'opt-page', 'opt-page/:id?');

            expect(result).toBe('/r/123?baseParam=1');
        });

        it('preserves query params when stripping full optional present-form', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page/789?baseParam=1', 'opt-page/789', 'opt-page/:id?');

            expect(result).toBe('/r/123?baseParam=1');
        });
    });

    describe('query params shared with the dynamic route underneath', () => {
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

        it('keeps the report of the details page under a category step opened from it', () => {
            // Given the category step of an expense stacked on the details page of its report, both carrying that report's ID
            const detailsSuffix = DYNAMIC_ROUTES.REPORT_DETAILS.path;
            const path = `r/A/${detailsSuffix}/${categorySuffix}?reportID=A&action=edit&iouType=submit&transactionID=t1`;

            // When the category suffix is stripped
            const backPath = getPathWithoutDynamicSuffix(path, categorySuffix);

            // Then `reportID` stays for the details page, which declares it, while the step's own params go
            expect(backPath).toBe(`r/A/${detailsSuffix}?reportID=A`);
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
});
