import {useContext} from 'react';
import {SplashScreenHiddenContext} from '@src/Expensify';

type SplashScreenHiddenContextType = {isSplashHidden: boolean; setIsSplashHidden: React.Dispatch<React.SetStateAction<boolean>>};

export default function useSplashScreen() {
    const {isSplashHidden, setIsSplashHidden} = useContext(SplashScreenHiddenContext) as SplashScreenHiddenContextType;
    return {isSplashHidden, setIsSplashHidden};
}

export type {SplashScreenHiddenContextType};
