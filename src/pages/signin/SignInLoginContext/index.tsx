import {Str} from 'expensify-common';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type LoginContextType = {
    login: string;
    setLogin: (login: string) => void;
};

const defaultLoginContext: LoginContextType = {
    login: '',
    setLogin: () => {},
};

const Context = React.createContext<LoginContextType>(defaultLoginContext);

function LoginProvider({children}: ChildrenProps) {
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [login, setLoginState] = useState(() => Str.removeSMSDomain(credentials?.login ?? ''));

    const setLogin = useCallback((newLogin: string) => {
        setLoginState(newLogin);
    }, []);

    const loginContext = useMemo<LoginContextType>(
        () => ({
            login,
            setLogin,
        }),
        [login, setLogin],
    );

    return <Context.Provider value={loginContext}>{children}</Context.Provider>;
}

function useLogin() {
    return useContext(Context);
}

LoginProvider.displayName = 'LoginProvider';

export {LoginProvider, useLogin, Context};
