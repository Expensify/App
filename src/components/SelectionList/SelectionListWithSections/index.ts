import SelectionListSearchStatus from '@components/SelectionList/components/SelectionListSearchStatus';

import SelectionListBody from './SelectionListBody';
import SelectionListRoot from './SelectionListRoot';
import SelectionListSearchInput from './SelectionListSearchInput';
import SelectionListViewport from './SelectionListViewport';

const SelectionListWithSections = Object.assign(SelectionListBody, {
    Root: SelectionListRoot,
    SearchInput: SelectionListSearchInput,
    SearchStatus: SelectionListSearchStatus,
    Viewport: SelectionListViewport,
});

export default SelectionListWithSections;
