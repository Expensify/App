import appendDynamicRouteSuffixToBasePath from '@libs/Navigation/helpers/dynamicRoutesUtils/appendDynamicRouteSuffixToBasePath';
import type {DynamicRouteSuffix} from '@src/ROUTES';

describe('appendDynamicRouteSuffixToBasePath', () => {
    it('should append a dynamic suffix to a base path', () => {
        const result = appendDynamicRouteSuffixToBasePath('workspace/123/categories', 'imported' as DynamicRouteSuffix);

        expect(result).toBe('workspace/123/categories/imported');
    });

    it('should append a dynamic suffix to a base path with query params', () => {
        const result = appendDynamicRouteSuffixToBasePath('workspace/123/categories?foo=bar', 'imported' as DynamicRouteSuffix);

        expect(result).toBe('workspace/123/categories/imported?foo=bar');
    });

    it('should return HOME when base path is empty', () => {
        const result = appendDynamicRouteSuffixToBasePath('', 'imported' as DynamicRouteSuffix);

        expect(result).toBe('home');
    });
});
