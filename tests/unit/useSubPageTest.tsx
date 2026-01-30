import type {RouteProp} from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Text from '@components/Text';
import useSubPage from '@hooks/useSubPage';
import type {PageConfig, SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

type AnyRoute = RouteProp<Record<string, Record<string, unknown> | undefined>, string>;
const mockUseRoute = jest.fn<AnyRoute, []>();
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actualNav = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockUseRoute(),
    };
});

const createMockSubPageComponent = (name: string): ComponentType<SubPageProps> => {
    function MockSubPageComponent({isEditing}: SubPageProps) {
        return <Text>{isEditing ? 'editing' : 'not editing'}</Text>;
    }
    MockSubPageComponent.displayName = name;
    return MockSubPageComponent;
};

const mockSubPageOne = createMockSubPageComponent('MockSubPageOne');
const mockSubPageTwo = createMockSubPageComponent('MockSubPageTwo');
const mockSubPageThree = createMockSubPageComponent('MockSubPageThree');
const mockSubPageFour = createMockSubPageComponent('MockSubPageFour');

const createMockPages = (): Array<PageConfig<SubPageProps>> => [
    {pageName: 'page1', component: mockSubPageOne},
    {pageName: 'page2', component: mockSubPageTwo},
    {pageName: 'page3', component: mockSubPageThree},
    {pageName: 'page4', component: mockSubPageFour},
];

const createBuildRoute = (): ((pageName: string, action?: 'edit') => Route) => {
    return (pageName: string, action?: 'edit'): Route => {
        const base = `/test/${pageName}` as Route;
        return action ? (`${base}?action=${action}` as Route) : base;
    };
};

const mockOnFinished = jest.fn();
const mockOnPageChange = jest.fn();

describe('useSubPage hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRoute.mockReturnValue({
            name: 'TestRoute',
            key: 'test-key',
            params: {},
        } as AnyRoute);
    });

    describe('initialization', () => {
        it('returns CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, lastPageIndex, moveTo, resetToPage', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, lastPageIndex, moveTo, resetToPage} = result.current;

            expect(CurrentPage).toBe(mockSubPageOne);
            expect(isEditing).toBe(false);
            expect(currentPageName).toBe('page1');
            expect(pageIndex).toBe(0);
            expect(lastPageIndex).toBe(3);
            expect(typeof prevPage).toBe('function');
            expect(typeof nextPage).toBe('function');
            expect(typeof moveTo).toBe('function');
            expect(typeof resetToPage).toBe('function');
        });

        it('starts at the first page when no subPage param is present and no startFrom is provided', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            expect(result.current.pageIndex).toBe(0);
            expect(result.current.currentPageName).toBe('page1');
            expect(result.current.isEditing).toBe(false);
        });

        it('starts at the startFrom index when provided and no subPage param is present', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    startFrom: 1,
                    buildRoute,
                }),
            );

            expect(result.current.pageIndex).toBe(1);
            expect(result.current.currentPageName).toBe('page2');
            expect(result.current.CurrentPage).toBe(mockSubPageTwo);
        });

        it('navigates to startFrom page on mount when no subPage param is present', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    startFrom: 2,
                    buildRoute,
                }),
            );

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page3'), {forceReplace: true});
        });

        it('does not navigate on mount when subPage param is present in URL', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page2'},
            } as AnyRoute);

            renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    startFrom: 0,
                    buildRoute,
                }),
            );

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('uses subPage from URL params when available', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page3'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            expect(result.current.pageIndex).toBe(2);
            expect(result.current.currentPageName).toBe('page3');
            expect(result.current.CurrentPage).toBe(mockSubPageThree);
        });

        it('returns isEditing true when action=edit is in URL params', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page2', action: 'edit'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            expect(result.current.isEditing).toBe(true);
        });

        it('falls back to first page when subPage param does not match any page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'nonExistentPage'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            expect(result.current.pageIndex).toBe(0);
            expect(result.current.CurrentPage).toBe(mockSubPageOne);
        });
    });

    describe('given skipPages as empty array', () => {
        it('calls onFinished when on the last page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page4'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            const finishData = {someData: 'value'};
            result.current.nextPage(finishData);

            expect(mockOnFinished).toHaveBeenCalledWith(finishData);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('navigates to the next page and calls onPageChange', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    onPageChange: mockOnPageChange,
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(mockOnPageChange).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page2'));
        });

        it('navigates to the previous page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page2'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.prevPage();

            expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('page1'));
        });

        it('does not navigate when calling prevPage on the first page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page1'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.prevPage();

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('navigates to a specific page index with edit mode by default when calling moveTo', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.moveTo(2);

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page3', 'edit'));
        });

        it('navigates without edit mode when turnOnEditMode is false', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.moveTo(1, false);

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page2'));
        });

        it('does not navigate when moveTo step index is out of bounds', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page1'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.moveTo(10);

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('navigates to the specified page when calling resetToPage', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.resetToPage('page3');

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page3'));
        });

        it('navigates to the first page when resetToPage is called without pageName', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page3'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.resetToPage();

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page1'));
        });

        it('navigates to last page when isEditing is true and nextPage is called', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page1', action: 'edit'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page4'));
            expect(mockOnFinished).not.toHaveBeenCalled();
        });
    });

    describe('given skipPages as non-empty array', () => {
        it('skips pages in skipPages array when navigating next', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page2'],
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page3'));
        });

        it('skips multiple consecutive pages in skipPages array when navigating next', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page2', 'page3'],
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page4'));
        });

        it('skips pages in skipPages array when navigating previous', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page4'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page3'],
                    buildRoute,
                }),
            );

            result.current.prevPage();

            expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('page2'));
        });

        it('skips multiple consecutive pages in skipPages array when navigating previous', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page4'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page2', 'page3'],
                    buildRoute,
                }),
            );

            result.current.prevPage();

            expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('page1'));
        });

        it('returns the correct lastPageIndex when some pages are skipped at the end', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page3', 'page4'],
                    buildRoute,
                }),
            );

            expect(result.current.lastPageIndex).toBe(1);
        });

        it('calls onFinished when navigating past the last non-skipped page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page2'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page3', 'page4'],
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(mockOnFinished).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('does not navigate when calling prevPage on the first non-skipped page', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page2'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page1'],
                    buildRoute,
                }),
            );

            result.current.prevPage();

            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('navigates to the last non-skipped page when isEditing and nextPage is called', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();
            mockUseRoute.mockReturnValue({
                name: 'TestRoute',
                key: 'test-key',
                params: {subPage: 'page1', action: 'edit'},
            } as AnyRoute);

            const {result} = renderHook(() =>
                useSubPage({
                    pages,
                    onFinished: mockOnFinished,
                    skipPages: ['page4'],
                    buildRoute,
                }),
            );

            result.current.nextPage();

            expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('page3'));
        });
    });

    describe('error handling', () => {
        it('throws an error when all pages are skipped', () => {
            const pages = createMockPages();
            const buildRoute = createBuildRoute();

            expect(() => {
                renderHook(() =>
                    useSubPage({
                        pages,
                        onFinished: mockOnFinished,
                        skipPages: ['page1', 'page2', 'page3', 'page4'],
                        buildRoute,
                    }),
                );
            }).toThrow('All pages are skipped');
        });
    });
});
