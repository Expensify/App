import {useContext} from 'react';
import {LocaleContext} from '@components/LocaleContextProvider';

export default function useLocalize() {
    return useContext(LocaleContext);
}
