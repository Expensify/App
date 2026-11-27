/**
 * Swaps the results area of the Search page from one search to the next without an empty list in between. The results
 * of the previous search stay on screen until the results of the new search lay out underneath them, so the new
 * results can mount after the interaction that changed the search instead of inside it.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import type {ContextType, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {createContext, useContext, useReducer, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {useSearchQueryActions, useSearchQueryContext} from './SearchContext';
import {
    SearchQueryActionsContext,
    SearchQueryContext,
    SearchResultsActionsContext,
    SearchResultsContext,
    SearchRowSelectionActionsContext,
    SearchSelectionActionsContext,
    SearchSelectionClearGenerationContext,
    SearchSelectionContext,
    SearchShiftRangeGroupsContext,
    SearchShouldUseLiveDataContext,
} from './SearchContextDefinitions';

type SearchContextValues = {
    results: ContextType<typeof SearchResultsContext>;
    resultsActions: ContextType<typeof SearchResultsActionsContext>;
    selection: ContextType<typeof SearchSelectionContext>;
    selectionActions: ContextType<typeof SearchSelectionActionsContext>;
    rowSelectionActions: ContextType<typeof SearchRowSelectionActionsContext>;
    shiftRangeGroups: ContextType<typeof SearchShiftRangeGroupsContext>;
    shouldUseLiveData: ContextType<typeof SearchShouldUseLiveDataContext>;
    selectionClearGeneration: ContextType<typeof SearchSelectionClearGenerationContext>;
};

type SearchResultsSwapProps = {
    /** Hash of the search the results belong to. */
    hash: number;

    /** Whether the results of `hash` report through `useMarkSearchResultsReady` once they lay out. Otherwise the previous results are dropped at once. */
    shouldWaitForResults?: boolean;

    /** The results area, keyed on `hash`. */
    children: ReactNode;
};

type Layer = {
    hash: number;
    children: ReactNode;
    queryContext: ReturnType<typeof useSearchQueryContext>;
    queryActions: ReturnType<typeof useSearchQueryActions>;

    /** Values of the other Search contexts the results were rendered with. */
    searchContextValues: SearchContextValues;

    /** Whether the results of this layer have laid out. */
    isReady?: boolean;
};

type HeldLayer = Layer & {
    /** Hash of the results that replace this layer once they lay out. */
    replacedByHash: number;
};

type SwapState = {
    current: Layer;
    held?: HeldLayer;
};

type SwapAction = {type: 'render'; layer: Layer; shouldWaitForResults: boolean} | {type: 'laidOut'; hash: number};

const MarkSearchResultsReadyContext = createContext<(hash: number) => void>(() => {});

const IsCoveredByPreviousResultsContext = createContext(false);

/** Returns the callback that tells the enclosing `SearchResultsSwap` that the results of a hash have laid out. */
function useMarkSearchResultsReady() {
    return useContext(MarkSearchResultsReadyContext);
}

/** Whether the results render hidden under the results of the previous search, which stay on screen until these lay out. */
function useIsCoveredByPreviousSearchResults() {
    return useContext(IsCoveredByPreviousResultsContext);
}

/** Search contexts provided above the results area. Held results keep the values they were rendered with, so a change made for the new search does not render them again. */
function useSearchContextValues(): SearchContextValues {
    return {
        results: useContext(SearchResultsContext),
        resultsActions: useContext(SearchResultsActionsContext),
        selection: useContext(SearchSelectionContext),
        selectionActions: useContext(SearchSelectionActionsContext),
        rowSelectionActions: useContext(SearchRowSelectionActionsContext),
        shiftRangeGroups: useContext(SearchShiftRangeGroupsContext),
        shouldUseLiveData: useContext(SearchShouldUseLiveDataContext),
        selectionClearGeneration: useContext(SearchSelectionClearGenerationContext),
    };
}

const SEARCH_CONTEXT_KEYS: Array<keyof SearchContextValues> = [
    'results',
    'resultsActions',
    'selection',
    'selectionActions',
    'rowSelectionActions',
    'shiftRangeGroups',
    'shouldUseLiveData',
    'selectionClearGeneration',
];

function haveSearchContextValuesChanged(previous: SearchContextValues, next: SearchContextValues) {
    return SEARCH_CONTEXT_KEYS.some((key) => previous[key] !== next[key]);
}

function provideSearchContexts(values: SearchContextValues, children: ReactNode) {
    return (
        <SearchResultsContext value={values.results}>
            <SearchResultsActionsContext value={values.resultsActions}>
                <SearchSelectionContext value={values.selection}>
                    <SearchSelectionActionsContext value={values.selectionActions}>
                        <SearchRowSelectionActionsContext value={values.rowSelectionActions}>
                            <SearchShiftRangeGroupsContext value={values.shiftRangeGroups}>
                                <SearchShouldUseLiveDataContext value={values.shouldUseLiveData}>
                                    <SearchSelectionClearGenerationContext value={values.selectionClearGeneration}>{children}</SearchSelectionClearGenerationContext>
                                </SearchShouldUseLiveDataContext>
                            </SearchShiftRangeGroupsContext>
                        </SearchRowSelectionActionsContext>
                    </SearchSelectionActionsContext>
                </SearchSelectionContext>
            </SearchResultsActionsContext>
        </SearchResultsContext>
    );
}

function swapReducer(state: SwapState, action: SwapAction): SwapState {
    if (action.type === 'laidOut') {
        const isCurrentNewlyReady = state.current.hash === action.hash && !state.current.isReady;
        const isHeldReplaced = state.held?.replacedByHash === action.hash;
        if (!isCurrentNewlyReady && !isHeldReplaced) {
            return state;
        }
        return {current: isCurrentNewlyReady ? {...state.current, isReady: true} : state.current, held: isHeldReplaced ? undefined : state.held};
    }

    const {layer, shouldWaitForResults} = action;
    if (state.current.hash === layer.hash) {
        // Results that stopped waiting, e.g. for a loading skeleton that never lays them out, release the held results.
        return {current: {...layer, isReady: state.current.isReady}, held: shouldWaitForResults ? state.held : undefined};
    }

    // A quick return to the held search takes its results back: they share the key of the new layer, so they stay mounted.
    if (state.held?.hash === layer.hash) {
        return {current: {...layer, isReady: state.held.isReady}};
    }

    // Results that never laid out showed nothing, so nothing has to stay on screen in their place.
    const visibleLayer = state.held ?? (state.current.isReady ? state.current : undefined);
    return {current: layer, held: shouldWaitForResults && visibleLayer ? {...visibleLayer, replacedByHash: layer.hash} : undefined};
}

function renderLayer(layer: Layer, markReady: (hash: number) => void, style: StyleProp<ViewStyle>, isCovered: boolean, isInteractive: boolean) {
    return (
        <SearchQueryContext
            key={layer.hash}
            value={layer.queryContext}
        >
            <SearchQueryActionsContext value={layer.queryActions}>
                <MarkSearchResultsReadyContext value={markReady}>
                    <IsCoveredByPreviousResultsContext value={isCovered}>
                        <View
                            style={style}
                            pointerEvents={isInteractive ? 'box-none' : 'none'}
                            accessibilityElementsHidden={isCovered}
                            importantForAccessibility={isCovered ? 'no-hide-descendants' : 'auto'}
                            aria-hidden={isCovered}
                        >
                            {provideSearchContexts(layer.searchContextValues, layer.children)}
                        </View>
                    </IsCoveredByPreviousResultsContext>
                </MarkSearchResultsReadyContext>
            </SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

function SearchResultsSwap({hash, shouldWaitForResults = false, children}: SearchResultsSwapProps) {
    const styles = useThemeStyles();
    const queryContext = useSearchQueryContext();
    const queryActions = useSearchQueryActions();
    const searchContextValues = useSearchContextValues();
    const layer: Layer = {hash, children, queryContext, queryActions, searchContextValues};
    const [{current, held}, dispatch] = useReducer(swapReducer, {current: layer});

    const hasLayerChanged =
        current.hash !== hash ||
        current.children !== children ||
        current.queryContext !== queryContext ||
        current.queryActions !== queryActions ||
        haveSearchContextValuesChanged(current.searchContextValues, searchContextValues);
    if (hasLayerChanged) {
        dispatch({type: 'render', layer, shouldWaitForResults});
    }

    // Search reads it in the dependencies of its layout callbacks, so it keeps one identity.
    const [markReady] = useState(() => (laidOutHash: number) => dispatch({type: 'laidOut', hash: laidOutHash}));

    // Both layers sit in one keyed array, so the held results keep their instance when the new layer mounts next to them.
    // The held results are frozen, so they take no input: a tap on them would act on state they no longer show.
    const currentLayer = renderLayer(layer, markReady, held ? [StyleSheet.absoluteFill, styles.opacity0] : StyleSheet.absoluteFill, !!held, !held);
    return held ? [renderLayer(held, markReady, StyleSheet.absoluteFill, false, false), currentLayer] : [currentLayer];
}

export default SearchResultsSwap;
export {useIsCoveredByPreviousSearchResults, useMarkSearchResultsReady};
