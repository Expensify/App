import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem, {DomainItem} from '@components/SelectionList/TravelDomainListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminsPrivateEmailDomains, getMostFrequentEmailDomain} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function DomainSelectorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [selectedDomain, setSelectedDomain] = useState<string | undefined>();

    const domains = useMemo(() => getAdminsPrivateEmailDomains(activePolicyID), [activePolicyID]);
    const recommendedDomain = useMemo(() => getMostFrequentEmailDomain(activePolicyID ?? '', domains), [activePolicyID, domains]);

    const data: DomainItem[] = useMemo(() => {
        return domains.map((domain) => {
            return {
                value: domain,
                isSelected: domain === selectedDomain,
                keyForList: domain,
                text: domain,
                isRecommended: domain === recommendedDomain,
            };
        });
    }, [domains, recommendedDomain, selectedDomain]);

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
                footerContent={<Button
                    isDisabled={!selectedDomain}
                    success
                    large
                    style={[styles.w100]}
                    onPress={() => {
                        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(selectedDomain ?? ''));
                    }}
                    text={translate('common.continue')}
                />}
            />
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'DomainSelectorPage';

export default DomainSelectorPage;
