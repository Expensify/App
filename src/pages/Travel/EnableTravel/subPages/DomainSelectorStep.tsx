import Button from '@components/ButtonComposed';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem from '@components/SelectionList/ListItem/TravelDomainListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setTravelProvisioningDomain} from '@libs/actions/Travel';
import {getAdminsPrivateEmailDomains, getMostFrequentEmailDomain} from '@libs/PolicyUtils';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';

type DomainItem = ListItem & {
    value: string;
    isRecommended: boolean;
};

function DomainSelectorStep({policy, onNext, resetToPage}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    const [selectedDomain, setSelectedDomain] = useState<string | undefined>();

    const domains = useMemo(() => getAdminsPrivateEmailDomains(policy), [policy]);
    const recommendedDomain = useMemo(() => getMostFrequentEmailDomain(domains, policy), [policy, domains]);

    const data: DomainItem[] = useMemo(() => {
        return domains.map((domain) => ({
            value: domain,
            isSelected: domain === selectedDomain,
            keyForList: domain,
            text: domain,
            isRecommended: domain === recommendedDomain,
        }));
    }, [domains, recommendedDomain, selectedDomain]);

    const handleContinue = () => {
        if (!selectedDomain) {
            return;
        }
        // The verify step normally precedes this one, but subPage is URL-controlled, so like the old standalone
        // domain-selector page, enforce account validation before proceeding. The verify step auto-advances
        // forward through the list once the account is validated.
        if (!isUserValidated) {
            resetToPage?.(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.VERIFY_ACCOUNT);
            return;
        }
        setTravelProvisioningDomain(selectedDomain);
        onNext();
    };

    return (
        <>
            <Text style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text>
            <View style={[styles.optionsListSectionHeader]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('travel.domainSelector.title')}</Text>
            </View>
            <SelectionList
                onSelectRow={(option) => setSelectedDomain(option.value)}
                data={data}
                ListItem={TravelDomainListItem}
                shouldShowTooltips
                footerContent={
                    <Button
                        isDisabled={!selectedDomain}
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.w100]}
                        onPress={handleContinue}
                    >
                        <Button.Text>{translate('common.continue')}</Button.Text>
                    </Button>
                }
            />
        </>
    );
}

export default DomainSelectorStep;
