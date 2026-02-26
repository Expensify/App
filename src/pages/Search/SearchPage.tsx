import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import Animated from 'react-native-reanimated';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {search, updateAdvancedFilters} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {lastSearchType, currentSearchResults, lastNonEmptySearchResults} = useSearchStateContext();
    const {clearSelectedTransactions, setLastSearchType} = useSearchActionsContext();
    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);

    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery), [route.params.q, route.params.rawQuery]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);

    const formValues = useFilterFormValues(queryJSON);

    useEffect(() => {
        updateAdvancedFilters(formValues, true);
    }, [formValues]);

    useConfirmReadyToOpenApp();

    const currentSearchType = currentSearchResults?.search?.type;
    useEffect(() => {
        if (!currentSearchType) {
            return;
        }

        setLastSearchType(currentSearchType);
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchType]);

    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();

    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;

    const metadata = searchResults?.search;

    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            setSearchRequestResponseStatusCode(null);
            search(value)?.then((jsonCode) => {
                setSearchRequestResponseStatusCode(Number(jsonCode ?? 0));
            });
        }
    }, []);

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    return (
        <Animated.View style={[styles.flex1]}>
            {shouldUseNarrowLayout ? (
                <DragAndDropProvider isDisabled={isDragDisabled}>
                    {PDFValidationComponent}
                    <SearchPageNarrow
                        queryJSON={queryJSON}
                        metadata={metadata}
                        searchResults={searchResults}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    />
                    <DragAndDropConsumer onDrop={initScanRequest}>
                        <DropZoneUI
                            icon={expensifyIcons.SmartScan}
                            dropTitle={translate('dropzone.scanReceipts')}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTextStyles={styles.receiptDropText}
                            dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </DragAndDropProvider>
            ) : (
                <SearchPageWide
                    queryJSON={queryJSON}
                    searchResults={searchResults}
                    metadata={metadata}
                    searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    handleSearchAction={handleSearchAction}
                    scrollHandler={scrollHandler}
                    initScanRequest={initScanRequest}
                    isDragDisabled={isDragDisabled}
                    PDFValidationComponent={PDFValidationComponent}
                    ErrorModal={ErrorModal}
                />
            )}
        </Animated.View>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
