import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem from '@components/SelectionList/TravelDomainListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {provisionDomain} from '@libs/actions/Travel';
import {getAdminsPrivateEmailDomains, getMostFrequentEmailDomain} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DomainItem = ListItem & {
    value: string;
    isRecommended: boolean;
};

function DomainSelectorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const policy = usePolicy(activePolicyID);
    const [selectedDomain, setSelectedDomain] = useState<string | undefined>();

    const domains = useMemo(() => getAdminsPrivateEmailDomains(policy), [policy]);
    const recommendedDomain = useMemo(() => getMostFrequentEmailDomain(domains, policy), [policy, domains]);

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
            shouldEnableMaxHeight
            testID={DomainSelectorPage.displayName}
        >
            <HeaderWithBackButton title={translate('travel.domainSelector.title')} />
            <Text style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text>
            <SelectionList
                onSelectRow={(option) => setSelectedDomain(option.value)}
                sections={[{title: translate('travel.domainSelector.title'), data}]}
                canSelectMultiple
                ListItem={TravelDomainListItem}
                shouldShowTooltips
                footerContent={
                    <Button
                        isDisabled={!selectedDomain}
                        success
                        large
                        style={[styles.w100]}
                        onPress={() => provisionDomain(selectedDomain ?? CONST.TRAVEL.DEFAULT_DOMAIN)}
                        text={translate('common.continue')}
                    />
                }
            />
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'DomainSelectorPage';

export default DomainSelectorPage;
