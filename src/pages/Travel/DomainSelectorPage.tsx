import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import React, {useCallback, useEffect, useState} from 'react';

function DomainSelectorPage() {
    
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={DomainSelectorPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('travel.domainSelector.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.mt3, styles.mr5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text>
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'TravelDomain';

export default DomainSelectorPage;
