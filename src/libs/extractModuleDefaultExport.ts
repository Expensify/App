import type DynamicModule from '@src/types/utils/DynamicModule';

/**
 * Extract the default export from something that's been dynamically imported with ESM import().
 * It should not be necessary, except that our Jest config mangles imports.
 */
export default function <T>(module: DynamicModule<T>): T {
    const topLevelDefault = module.default;
    if (topLevelDefault && typeof topLevelDefault === 'object' && 'default' in topLevelDefault) {
        return topLevelDefault.default;
    }
    return topLevelDefault;
}
