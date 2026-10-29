import Navigation from '@libs/Navigation/Navigation';

import React from 'react';

import ABADepositDetails from './ABADepositDetails';

function ABADepositAccountPage() {
    return <ABADepositDetails onBackButtonPress={() => Navigation.goBack()} />;
}

export default ABADepositAccountPage;
