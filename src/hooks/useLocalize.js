import {useContext} from 'react';
import {LocaleContext} from '../components/withLocalize';

export default function useLocalize() {
    useContext(LocaleContext);
}
