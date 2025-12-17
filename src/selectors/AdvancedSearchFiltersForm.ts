import type {OnyxEntry} from 'react-native-onyx';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

const columnsSelector = (form: OnyxEntry<SearchAdvancedFiltersForm>) => form?.columns;

// eslint-disable-next-line import/prefer-default-export
export {columnsSelector};
