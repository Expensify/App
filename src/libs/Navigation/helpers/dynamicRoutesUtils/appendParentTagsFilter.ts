/**
 * Appends the parentTagsFilter query param to a route when present.
 * Used for dependent tag navigation where the filter disambiguates same-named tags.
 */
function appendParentTagsFilter(route: string, parentTagsFilter?: string): string {
    if (!parentTagsFilter) {
        return route;
    }
    const separator = route.includes('?') ? '&' : '?';
    return `${route}${separator}parentTagsFilter=${encodeURIComponent(parentTagsFilter)}`;
}

export default appendParentTagsFilter;
