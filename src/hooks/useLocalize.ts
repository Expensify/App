import {useContext} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {LocaleContext} from '@components/LocaleContextProvider';

export default function useLocalize(): LocaleContextProps {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocalize must be used within LocaleContextProvider');
    }
    return ctx;
}
