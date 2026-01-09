import {useRoute} from '@react-navigation/native';
import type {ComponentType} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {PageConfig, SubPageProps, UseSubPageProps} from './types';

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
    return lastIndex;
}

/**
 * This hook ensures uniform handling of components across different pages, enabling seamless integration and navigation through sub pages.
 * Unlike useSubStep, this hook operates on URL-based navigation where each sub page has its own route.
 *
 * @param pages - array of objects with pageName and component to display in each page
 * @param onFinished - callback triggered after finishing the last page
 * @param initialPageName - name of initial page (used when no subStep param in URL)
 * @param onPageChange - callback triggered after finishing each page
 * @param skipPages - array of page names to skip
 * @param buildRoute - function that returns the route for a given page name and optional action
 */
export default function useSubPage<TProps extends SubPageProps>({pages, onFinished, initialPageName, skipPages = [], onPageChange = () => {}, buildRoute}: UseSubPageProps<TProps>) {
    const route = useRoute();
    const params = route.params as {subStep?: string; action?: 'edit'} | undefined;
    const currentPageName = params?.subStep ?? initialPageName ?? pages.at(0)?.pageName;
    const isEditing = params?.action === 'edit';
    const pageIndex = findPageIndex(pages, currentPageName);
    const lastPageIndex = findLastPageIndex(pages, skipPages);
    const lastPageName = pages.at(lastPageIndex)?.pageName;

    const navigateToPage = (pageName: string, action?: 'edit') => {
        Navigation.navigate(buildRoute(pageName, action));
    };

    if (pages.length === skipPages.length) {
        throw new Error('All pages are skipped');
    }

    const prevPage = () => {
        let targetIndex = pageIndex - 1;
        while (targetIndex >= 0 && skipPages.includes(pages.at(targetIndex)?.pageName ?? '')) {
            targetIndex -= 1;
        }

        if (targetIndex < 0) {
            return;
        }

        const targetPage = pages.at(targetIndex);
        if (targetPage) {
            navigateToPage(targetPage.pageName);
        }
    };

    const nextPage = (finishData?: unknown) => {
        if (isEditing && lastPageName) {
            navigateToPage(lastPageName);
            return;
        }

        let targetIndex = pageIndex + 1;
        while (targetIndex < pages.length && skipPages.includes(pages.at(targetIndex)?.pageName ?? '')) {
            targetIndex += 1;
        }

        if (targetIndex > lastPageIndex) {
            onFinished(finishData);
        } else {
            const targetPage = pages.at(targetIndex);
            if (targetPage) {
                onPageChange();
                navigateToPage(targetPage.pageName);
            }
        }
    };

    const moveTo = (step: number, turnOnEditMode?: boolean) => {
        const pageName = pages.at(step)?.pageName;
        if (!pageName) {
            return;
        }
        const shouldEdit = !(turnOnEditMode !== undefined && !turnOnEditMode);
        navigateToPage(pageName, shouldEdit ? 'edit' : undefined);
    };

    const resetToPage = (pageName?: string) => {
        const targetPage = pageName ?? pages.at(0)?.pageName;
        if (targetPage) {
            navigateToPage(targetPage);
        }
    };

    const goToLastPage = () => {
        if (!lastPageName) {
            return;
        }
        navigateToPage(lastPageName);
    };

    const currentPage = pages.at(pageIndex);

    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        CurrentPage: currentPage?.component as ComponentType<SubPageProps & TProps>,
        isEditing,
        currentPageName,
        pageIndex,
        prevPage,
        nextPage,
        lastPageIndex,
        moveTo,
        resetToPage,
        goToLastPage,
    };
}
