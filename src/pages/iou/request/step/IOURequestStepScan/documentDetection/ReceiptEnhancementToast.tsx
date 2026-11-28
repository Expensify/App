/** Short dark pill at the bottom of the camera viewfinder confirming that receipt enhancements were turned on. */
import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';

import ReceiptStatusPill from './ReceiptStatusPill';

type ReceiptEnhancementToastProps = {
    onHide: () => void;
};

function ReceiptEnhancementToast({onHide}: ReceiptEnhancementToastProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    useEffect(() => {
        const hideTimer = setTimeout(onHide, CONST.GROWL.DURATION);
        return () => clearTimeout(hideTimer);
    }, [onHide]);

    return (
        <ReceiptStatusPill message={translate('receipt.receiptEnhancementsEnabled')}>
            <Icon
                src={icons.Sparkles}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                fill={theme.iconSuccessFill}
            />
        </ReceiptStatusPill>
    );
}

export default ReceiptEnhancementToast;
