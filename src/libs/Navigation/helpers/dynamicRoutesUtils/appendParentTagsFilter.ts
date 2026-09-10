/**
 * Appends the parentTagsFilter query param to a route when present.
 * Used for dependent tag navigation where the filter disambiguates same-named tags.
 */
function appendParentTagsFilter(route: string, parentTagsFilter?: string): string {
    return parentTagsFilter ? `${route}?parentTagsFilter=${encodeURIComponent(parentTagsFilter)}` : route;
}

export default appendParentTagsFilter;
