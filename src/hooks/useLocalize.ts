import {useContext} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {LocaleContext} from '@components/LocaleContextProvider';

export default function useLocalize(): LocaleContextProps {
    return useContext(LocaleContext);
}
