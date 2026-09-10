/**
 * Sorts a list of objects by one of their string keys using the caller's locale comparator.
 *
 * It lives outside `OptionsListUtils` so that callers needing only this sort do not have to import that module,
 * which pulls in `ReportUtils` and the action layer and closes an import cycle.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

function sortAlphabetically<T extends Partial<Record<TKey, string | undefined>>, TKey extends keyof T>(items: T[], key: TKey, localeCompare: LocaleContextProps['localeCompare']): T[] {
    return items.sort((a, b) => localeCompare(a[key]?.toLowerCase() ?? '', b[key]?.toLowerCase() ?? ''));
}

export default sortAlphabetically;
