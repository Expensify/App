import React from 'react';
import Icon from '@components/Icon';
import {PaymentHands} from '@components/Icon/Illustrations';
import useWindowDimensions from '@hooks/useWindowDimensions';

function ReferralDetailsPageIcon() {
    const {windowWidth} = useWindowDimensions();

    return (
        <Icon
            src={PaymentHands}
            width={windowWidth * 2}
            height={232}
        />
    );
}

export default ReferralDetailsPageIcon;
