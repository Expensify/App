type GettingStartedItem = {
    key: string;
    label: string;
    isComplete: boolean;
    route: string;
};

type UseGettingStartedItemsResult = {
    shouldShowSection: boolean;
    items: GettingStartedItem[];
};

/**
 * Hook that determines which "Getting Started" checklist items to show
 * on the Home page for users with the manage-team onboarding intent.
 *
 * TODO: Implement logic — this is a stub for TDD.
 */
function useGettingStartedItems(): UseGettingStartedItemsResult {
    return {
        shouldShowSection: false,
        items: [],
    };
}

export default useGettingStartedItems;
export type {GettingStartedItem, UseGettingStartedItemsResult};
