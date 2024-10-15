import { isMobile } from "@libs/Browser";

function getBottomSuggestionPadding(): number {
    if (!isMobile()) {
        return -6;
    }
    return 6;
}

export default getBottomSuggestionPadding;
