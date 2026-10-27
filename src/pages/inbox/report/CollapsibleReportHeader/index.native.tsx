import type {CollapsibleReportHeaderProps} from './types';

/**
 * Collapsing the report header on scroll is for mobile web landscape only, so native renders the header as is.
 */
function CollapsibleReportHeader({children}: CollapsibleReportHeaderProps) {
    return children;
}

export default CollapsibleReportHeader;
