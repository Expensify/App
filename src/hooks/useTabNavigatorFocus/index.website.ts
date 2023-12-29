import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';

type NavStateCallback = (data: {data: {state: {index: number}}}) => void;

type UseTabNavigatorFocusParams = {
    tabIndex: number;
};

function useTabNavigatorFocus({tabIndex}: UseTabNavigatorFocusParams): boolean {
    const nav = useNavigation();

    const [focused, setFocused] = useState(() => nav.getState().index === tabIndex);

    useEffect(() => {
        const setCurrentFocus: NavStateCallback = ({data}) => {
            setFocused(data.state.index === tabIndex);
        };

        nav.addListener('state', setCurrentFocus);

        return () => {
            nav.removeListener('state', setCurrentFocus);
        };
    }, [nav, tabIndex]);

    return focused;
}

export default useTabNavigatorFocus;
