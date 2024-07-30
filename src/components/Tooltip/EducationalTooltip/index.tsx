import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import type {TooltipExtendedProps} from '@components/Tooltip/types';
import BaseEducationalTooltip from './BaseEducationalTooltip';

function EducationalTooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    const navigation = useNavigation();
    const [shouldHide, setShouldHide] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setShouldHide(true);
        });
        return unsubscribe;
    }, [navigation]);

    if (!shouldRender || shouldHide) {
        return children;
    }

    return (
        <BaseEducationalTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </BaseEducationalTooltip>
    );
}

EducationalTooltip.displayName = 'EducationalTooltip';

export default EducationalTooltip;
