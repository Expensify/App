import type {ComponentType} from 'react';
import type {Route} from '@src/ROUTES';

type SubPageProps = {
    /** value indicating whether user is editing one of the sub pages */
    isEditing?: boolean;

    /** continues to next sub page */
    onNext: (data?: unknown) => void;

    /** moves user to passed sub page index */
    onMove: (pageIndex: number, turnOnEditMode?: boolean) => void;

    /** name of currently displayed sub page */
    currentPageName?: string;

    /** moves user to previous sub page */
    prevPage?: () => void;

    /** resets to a specific page by name */
    resetToPage?: (pageName?: string) => void;
};

type PageConfig<TProps extends SubPageProps> = {
    /** unique page name used as URL parameter */
    pageName: string;

    /** component to render for this page */
    component: ComponentType<SubPageProps & TProps>;
};

type UseSubPageProps<TProps extends SubPageProps> = {
    /** array of objects with pageName and component for each sub page */
    pages: Array<PageConfig<TProps>>;

    /** called after each sub page navigation */
    onPageChange?: () => void;

    /** called on last sub page */
    onFinished: (data?: unknown) => void;

    /** index of the page to start from (used when no subPage param in URL) */
    startFrom?: number;

    /** array of page names to skip */
    skipPages?: string[];

    /** function that returns the route for a given page name and optional action */
    buildRoute: (pageName: string, action?: 'edit') => Route;
};

export type {SubPageProps, PageConfig, UseSubPageProps};
