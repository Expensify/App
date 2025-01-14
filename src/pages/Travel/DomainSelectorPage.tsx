import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem, {DomainItem} from '@components/SelectionList/TravelDomainListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import React, {useCallback, useEffect, useState} from 'react';

function DomainSelectorPage() {
    
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const data: DomainItem[] = [
        {
            value: 'domain.com',
            isSelected: false,
            keyForList: 'domain.com',
            text: 'domain.com',
            isRecommended: false,
        },
        {
            value: 'domain2.com',
            isSelected: true,
            keyForList: 'domain2.com',
            text: 'domain2.com',
            isRecommended: true,
        },
    ];
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
            <Text style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text>
            <SelectionList
                onSelectRow={() => {}}
                sections={[{title: translate('travel.domainSelector.title'), data}]}
                canSelectMultiple
                ListItem={TravelDomainListItem}
                shouldShowTooltips
            />
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'TravelDomain';

export default DomainSelectorPage;
