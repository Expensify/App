import {useContext} from 'react';
import type {LocaleActionsContextValue, LocaleContextValue, LocaleStateContextValue} from '@components/LocaleContextProvider';
import {LocaleActionsContext, LocaleContext, LocaleStateContext} from '@components/LocaleContextProvider';

function useStateLocalize(): LocaleStateContextValue {
    return useContext(LocaleStateContext);
}

function useActionsLocalize(): LocaleActionsContextValue {
    return useContext(LocaleActionsContext);
}

export default function useLocalize(): LocaleContextValue {
    return useContext(LocaleContext);
}

export {useStateLocalize, useActionsLocalize};
