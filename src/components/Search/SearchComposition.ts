/**
 * Search Composition Module
 *
 * This module provides a composable Search interface following the composition pattern
 * from Fernando Rojo's talk. Components are organized as LEGO blocks that can be
 * freely composed to build different search layouts.
 *
 * Pattern: state/actions/meta organization
 * - state: All data/values representing current search state
 * - actions: All functions that modify the search state
 * - meta: Configuration and metadata
 *
 * Usage:
 * ```tsx
 * import { Search } from '@components/Search/SearchComposition';
 *
 * // Using the provider
 * <Search.Provider queryJSON={queryJSON}>
 *   <Search.Header />
 *   <Search.List />
 *   <Search.Footer />
 * </Search.Provider>
 *
 * // Using the hook with state/actions/meta
 * const { state, actions, meta } = Search.useSearch();
 * ```
 */

// Context and Provider
import {SearchContextProvider, useSearchContext, useSearchContextLegacy} from './SearchContext';
import type {SearchContextProps, SearchState, SearchActions, SearchMeta} from './SearchContext';

// Page Header components
import SearchPageHeader from './SearchPageHeader/SearchPageHeader';
import SearchFiltersBar from './SearchPageHeader/SearchFiltersBar';
import SearchPageHeaderInput from './SearchPageHeader/SearchPageHeaderInput';
import SearchTypeMenuPopover from './SearchPageHeader/SearchTypeMenuPopover';

// Footer component
import SearchPageFooter from './SearchPageFooter';

// List components
import SearchList from './SearchList';

// Scope Provider
import {SearchScopeProvider} from './SearchScopeProvider';

// Router components
import SearchRouter from './SearchRouter/SearchRouter';

// Autocomplete components
import SearchAutocompleteInput from './SearchAutocompleteInput';
import SearchAutocompleteList from './SearchAutocompleteList';

// Types
import type {
    SearchQueryJSON,
    SearchParams,
    SelectedTransactions,
    SelectedTransactionInfo,
    SearchColumnType,
    SortOrder,
    BankAccountMenuItem,
} from './types';

/**
 * Search Compound Component
 *
 * Exports all Search-related components using dot notation for clean composition.
 * This follows the composition pattern from Fernando Rojo's talk.
 *
 * Example:
 * ```tsx
 * <Search.Provider queryJSON={queryJSON}>
 *   <Search.Header queryJSON={queryJSON} />
 *   <Search.FiltersBar queryJSON={queryJSON} />
 *   <Search.List />
 *   <Search.Footer />
 * </Search.Provider>
 * ```
 */
const Search = {
    // === Provider ===
    /** Context provider that wraps search components and provides state/actions/meta */
    Provider: SearchContextProvider,

    /** Scope provider for search-specific context */
    ScopeProvider: SearchScopeProvider,

    // === Header Components ===
    /** Main search page header with search input and action buttons */
    Header: SearchPageHeader,

    /** Filters bar showing active filters as chips */
    FiltersBar: SearchFiltersBar,

    /** Search input component used in the header */
    HeaderInput: SearchPageHeaderInput,

    /** Type menu popover for switching between search types */
    TypeMenu: SearchTypeMenuPopover,

    // === List Components ===
    /** Main search results list component */
    List: SearchList,

    // === Footer Components ===
    /** Search page footer showing selection count and total */
    Footer: SearchPageFooter,

    // === Router Components ===
    /** Search router for handling search navigation and routing */
    Router: SearchRouter,

    // === Autocomplete Components ===
    /** Autocomplete input for search queries */
    AutocompleteInput: SearchAutocompleteInput,

    /** Autocomplete suggestions list */
    AutocompleteList: SearchAutocompleteList,

    // === Hooks ===
    /**
     * Hook to access search context with state/actions/meta organization
     *
     * Returns:
     * - state: All search data and UI state
     * - actions: All functions to modify search state
     * - meta: Configuration and metadata
     */
    useSearch: useSearchContext,

    /**
     * Legacy hook for backward compatibility during migration
     * @deprecated Use Search.useSearch() with state/actions/meta structure instead
     */
    useSearchLegacy: useSearchContextLegacy,
};

// Export the compound component
export default Search;

// Export individual components for direct imports if needed
export {
    SearchContextProvider,
    useSearchContext,
    useSearchContextLegacy,
    SearchPageHeader,
    SearchFiltersBar,
    SearchPageHeaderInput,
    SearchTypeMenuPopover,
    SearchPageFooter,
    SearchList,
    SearchScopeProvider,
    SearchRouter,
    SearchAutocompleteInput,
    SearchAutocompleteList,
};

// Export types
export type {
    SearchContextProps,
    SearchState,
    SearchActions,
    SearchMeta,
    SearchQueryJSON,
    SearchParams,
    SelectedTransactions,
    SelectedTransactionInfo,
    SearchColumnType,
    SortOrder,
    BankAccountMenuItem,
};
