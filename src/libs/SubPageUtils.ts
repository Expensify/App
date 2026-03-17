import type {PageConfig, SubPageProps} from '@hooks/useSubPage/types';

function findPageIndex<TProps extends SubPageProps>(pages: Array<PageConfig<TProps>>, pageName?: string): number {
    if (!pageName) {
        return 0;
    }

    const index = pages.findIndex((page) => page.pageName === pageName);
    return index !== -1 ? index : 0;
}

function findLastPageIndex<TProps extends SubPageProps>(pages: Array<PageConfig<TProps>>, skipPages: string[] = []): number {
    let lastIndex = pages.length - 1;
    while (lastIndex >= 0 && skipPages.includes(pages.at(lastIndex)?.pageName ?? '')) {
        lastIndex -= 1;
    }
    return lastIndex !== -1 ? lastIndex : 0;
}

export {findPageIndex, findLastPageIndex};
