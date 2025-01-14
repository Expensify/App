import React, {useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem, {DomainItem} from '@components/SelectionList/TravelDomainListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Button from '@components/Button';

function DomainSelectorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedDomain, setSelectedDomain] = useState('');

    const domains: string[] = ['domain.com', 'domain2.com', 'domain3.com'];
    const data: DomainItem[] = useMemo(
        () =>
            Object.values(domains).map((domain) => {
                return {
                    value: domain,
                    isSelected: domain === selectedDomain,
                    keyForList: domain,
                    text: domain,
                    isRecommended: domain === 'domain.com',
                };
            }),
        [domains, selectedDomain],
    );

    const footerContent = useMemo(
        () => (
            <Button
                isDisabled={selectedDomain.length <= 0}
                success
                large
                style={[styles.w100]}
                onPress={() => {}}
                text={translate('common.continue')}
            />
        ),
        [selectedDomain, translate, styles],
    );

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
                onSelectRow={(option) => setSelectedDomain(option.value)}
                sections={[{title: translate('travel.domainSelector.title'), data}]}
                canSelectMultiple
                ListItem={TravelDomainListItem}
                shouldShowTooltips
                footerContent={footerContent}
            />
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'DomainSelectorPage';

export default DomainSelectorPage;
