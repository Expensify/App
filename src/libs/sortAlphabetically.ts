import type {LocaleContextProps} from '@components/LocaleContextProvider';

function sortAlphabetically<T extends Partial<Record<TKey, string | undefined>>, TKey extends keyof T>(items: T[], key: TKey, localeCompare: LocaleContextProps['localeCompare']): T[] {
    return items.sort((a, b) => localeCompare(a[key]?.toLowerCase() ?? '', b[key]?.toLowerCase() ?? ''));
}

export default sortAlphabetically;
