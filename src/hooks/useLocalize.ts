import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {LocaleContext} from '@components/LocaleContextProvider';

import {useContext} from 'react';

export default function useLocalize(): LocaleContextProps {
    return useContext(LocaleContext);
}
