import type {StackCardInterpolationProps} from '@react-navigation/stack';
import {useMemo} from 'react';
import {isSafari} from '@libs/Browser';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useSideModalStackScreenOptions from './useSideModalStackScreenOptions';

const useCustomScreenOptions = () => {
    const modalNavigatorOptions = useSideModalStackScreenOptions();
    const customInterpolator = useModalCardStyleInterpolator();

    return useMemo(() => {
        if (isSafari()) {
            return {
                ...modalNavigatorOptions,
                web: {
                    ...modalNavigatorOptions.web,
                    cardStyleInterpolator: (props: StackCardInterpolationProps) => customInterpolator({props}),
                },
            };
        }

        return modalNavigatorOptions;
    }, [customInterpolator, modalNavigatorOptions]);
};

export default useCustomScreenOptions;
