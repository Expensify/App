import React from 'react';
import PropTypes from 'prop-types';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Clipboard from '../../../../libs/Clipboard';
import useLocalize from '../../../../hooks/useLocalize';
import cardDetailsPropTypes from './cardDetailsPropTypes';

const propTypes = {
    details: PropTypes.objectOf(cardDetailsPropTypes),
};

const defaultProps = {
    details: {
        pan: '',
        expiration: '',
        cvv: '',
        address: '',
    },
};

function CardDetails({details}) {
    const {translate} = useLocalize();

    const handleCopyToClipboard = () => {
        Clipboard.setString(details.pan);
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.cardNumber')}
                title={details.pan}
                iconRight={Expensicons.Copy}
                shouldShowRightIcon
                interactive={false}
                onIconRightPress={handleCopyToClipboard}
                iconRightAccessibilityLabel={translate('walletPage.cardDetails.copyCardNumber')}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.expiration')}
                title={details.expiration}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.cvv')}
                title={details.cvv}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.address')}
                title={details.address}
                interactive={false}
            />
        </>
    );
}

CardDetails.displayName = 'CardDetails';
CardDetails.propTypes = propTypes;
CardDetails.defaultProps = defaultProps;

export default CardDetails;
