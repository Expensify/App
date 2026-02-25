import {useContext} from 'react';
import type {LocaleContextValue} from '@components/LocaleContextProvider';
import {LocaleContext} from '@components/LocaleContextProvider';

export default function useLocalize(): LocaleContextValue {
    return useContext(LocaleContext);
}
