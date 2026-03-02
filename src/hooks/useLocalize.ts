import {useContext} from 'react';
import type {LocaleActionsContextValue, LocaleStateContextValue} from '@components/LocaleContextProvider';
import {LocaleActionsContext, LocaleStateContext} from '@components/LocaleContextProvider';

function useStateLocalize(): LocaleStateContextValue {
    return useContext(LocaleStateContext);
}

function useActionsLocalize(): LocaleActionsContextValue {
    return useContext(LocaleActionsContext);
}

export {useStateLocalize, useActionsLocalize};
