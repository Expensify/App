import {useRoute} from '@react-navigation/native';
import type {ComponentType} from 'react';
import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {findLastPageIndex, findPageIndex} from '@libs/SubPageUtils';
import type {SubPageProps, UseSubPageProps} from './types';

const AMOUNT_OF_FRAMES_TO_WAIT_FOR = 20;

/**
 * @param pages - array of objects with pageName and component to display in each page
 * @param onFinished - callback triggered after finishing the last page
 * @param startFrom - index of the page to start from (used when no subPage param in URL)
 * @param onPageChange - callback triggered after finishing each page
 * @param skipPages - array of page names to skip
 * @param buildRoute - function that returns the route for a given page name and optional action
 */
export default function useSubPage<TProps extends SubPageProps>({pages, onFinished, startFrom = 0, skipPages = [], onPageChange = () => {}, buildRoute}: UseSubPageProps<TProps>) {
    const route = useRoute();
    const params = route.params as {subPage?: string; action?: 'edit'} | undefined;
    const urlPageName = params?.subPage;
    const isEditing = params?.action === 'edit';

    const startPageName = pages.at(startFrom)?.pageName;
    const isRedirecting = !urlPageName && !!startPageName;

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }

        let requestID: number;
        const waitFrames = (framesLeft: number) => {
            if (framesLeft <= 0) {
                Navigation.navigate(buildRoute(startPageName), {forceReplace: true});
                return;
            }
            requestID = requestAnimationFrame(() => waitFrames(framesLeft - 1));
        };

        requestID = requestAnimationFrame(() => waitFrames(AMOUNT_OF_FRAMES_TO_WAIT_FOR));

        return () => {
            cancelAnimationFrame(requestID);
        };
    }, [isRedirecting, startPageName, buildRoute]);

    const currentPageName = urlPageName ?? startPageName ?? pages.at(0)?.pageName;
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
            Navigation.goBack(buildRoute(targetPage.pageName));
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
