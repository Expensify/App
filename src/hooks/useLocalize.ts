import {useContext} from 'react';
import {LocaleContext, LocaleContextProps} from '@components/LocaleContextProvider';

export default function useLocalize(): LocaleContextProps {
    return useContext(LocaleContext);
}
