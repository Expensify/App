import {useContext} from 'react';
import {LocaleContext} from '../components/createLocaleContext';

export default function useLocalize() {
    return useContext(LocaleContext);
}
