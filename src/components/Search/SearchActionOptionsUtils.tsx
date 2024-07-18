import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

function getDownloadOption(text: string, onSelected?: () => void): DropdownOption<SearchHeaderOptionValue> {
    return {
        icon: Expensicons.Download,
        text,
        value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
        shouldCloseModalOnSelect: true,
        onSelected,
    };
}

export default getDownloadOption;
