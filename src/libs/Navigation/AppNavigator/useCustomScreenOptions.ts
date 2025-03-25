import type {StackCardInterpolationProps} from '@react-navigation/stack';
import {useMemo} from 'react';
import {isSafari} from '@libs/Browser';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useSideModalStackScreenOptions from './useSideModalStackScreenOptions';

const useCustomScreenOptions = () => {
    const modalNavigatorOptions = useSideModalStackScreenOptions();
    const customInterpolator = useModalCardStyleInterpolator();

    return useMemo(() => {
        // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
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
