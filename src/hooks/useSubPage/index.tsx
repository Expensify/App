import Navigation from '@libs/Navigation/Navigation';
import {findLastPageIndex, findPageIndex} from '@libs/SubPageUtils';

import type {ComponentType} from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';

import type {SubPageProps, UseSubPageProps} from './types';

/**
 * @param pages - array of objects with pageName and component to display in each page
 * @param onFinished - callback triggered after finishing the last page
 * @param startFrom - index of the page to start from (used when no subPage param in URL)
 * @param onPageChange - callback triggered after finishing each page
 * @param skipPages - array of page names to skip
 * @param buildRoute - function that returns the route for a given page name and optional action
 */
export default function useSubPage<TProps extends SubPageProps, TPageName extends string = string>({
    pages,
    onFinished,
    startFrom = 0,
    skipPages = [],
    onPageChange = () => {},
    buildRoute,
    shouldReplaceRoute = false,
}: UseSubPageProps<TProps, TPageName>) {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as {subPage?: string; action?: 'edit'} | undefined;
    const urlPageName = params?.subPage;
    const isEditing = params?.action === 'edit';

    const startPageName = startFrom >= 0 ? pages.at(startFrom)?.pageName : undefined;
    const isRedirecting = !urlPageName && (!!startPageName || startFrom < 0);

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }

        navigation.setParams({subPage: startPageName} as Record<string, unknown>);
    }, [isRedirecting, startPageName, navigation]);

    const currentPageName = urlPageName ?? startPageName ?? pages.at(0)?.pageName;
    const pageIndex = findPageIndex(pages, currentPageName);
    const lastPageIndex = findLastPageIndex(pages, skipPages);
    const lastPageName = pages.at(lastPageIndex)?.pageName;

    const navigateToPage = useCallback(
        (pageName: TPageName, action?: 'edit') => {
            if (shouldReplaceRoute) {
                Navigation.navigate(buildRoute(pageName, action), {forceReplace: true});
                return;
            }
            Navigation.navigate(buildRoute(pageName, action));
        },
        [buildRoute, shouldReplaceRoute],
    );

    const prevPage = useCallback(() => {
        let targetIndex = pageIndex - 1;
        while (targetIndex >= 0) {
            const targetIndexPageName = pages.at(targetIndex)?.pageName;
            if (!targetIndexPageName || !skipPages.includes(targetIndexPageName)) {
                break;
            }
            targetIndex -= 1;
        }

        if (targetIndex < 0) {
            return;
        }

        const targetPage = pages.at(targetIndex);
        if (targetPage) {
            // When routes are replaced (dynamic routes), the flow keeps a single screen in the stack,
            // so there is nothing to pop back to - navigate (replacing) to the previous page instead.
            if (shouldReplaceRoute) {
                Navigation.navigate(buildRoute(targetPage.pageName), {forceReplace: true});
                return;
            }
            Navigation.goBack(buildRoute(targetPage.pageName));
        }
    }, [pageIndex, pages, skipPages, buildRoute, shouldReplaceRoute]);

    const nextPage = useCallback(
        (finishData?: unknown) => {
            if (isEditing && lastPageName) {
                navigateToPage(lastPageName);
                return;
            }

            let targetIndex = pageIndex + 1;
            while (targetIndex < pages.length) {
                const targetIndexPageName = pages.at(targetIndex)?.pageName;
                if (!targetIndexPageName || !skipPages.includes(targetIndexPageName)) {
                    break;
                }
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
        },
        [isEditing, lastPageName, navigateToPage, pageIndex, pages, skipPages, lastPageIndex, onFinished, onPageChange],
    );

    const moveTo = useCallback(
        (step: number, turnOnEditMode?: boolean) => {
            const pageName = pages.at(step)?.pageName;
            if (!pageName) {
                return;
            }
            const shouldEdit = !(turnOnEditMode !== undefined && !turnOnEditMode);
            navigateToPage(pageName, shouldEdit ? 'edit' : undefined);
        },
        [pages, navigateToPage],
    );

    const resetToPage = useCallback(
        (pageName?: TPageName) => {
            const targetPage = pageName ?? pages.at(0)?.pageName;
            if (targetPage) {
                navigateToPage(targetPage);
            }
        },
        [pages, navigateToPage],
    );

    if (pages.length === skipPages.length) {
        throw new Error('All pages are skipped');
    }

    const currentPage = pages.at(pageIndex);

    return {
        // Type assertion for component type - pageIndex defaults to 0 via findPageIndex, so currentPage should exist for non-empty pages array
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
        isRedirecting,
    };
}
