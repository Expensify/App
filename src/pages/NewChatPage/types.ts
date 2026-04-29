import type {ListItem} from '@components/SelectionList/types';
import type {OptionData} from '@libs/ReportUtils';

type SelectedOption = ListItem &
    Omit<OptionData, 'reportID'> & {
        reportID?: string;
    };

export default SelectedOption;
