import Badge from '@components/Badge';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {setTravelProvisioningDomain} from '@libs/actions/Travel';
import {getAdminsPrivateEmailDomains, getMostFrequentEmailDomain} from '@libs/PolicyUtils';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';

import React, {useMemo, useState} from 'react';
import {View} from 'react-native';

type DomainItem = ListItem & {
    value: string;
};

function DomainSelectorStep({policy, onNext}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [selectedDomain, setSelectedDomain] = useState<string | undefined>();

    const domains = useMemo(() => getAdminsPrivateEmailDomains(policy), [policy]);
    const recommendedDomain = useMemo(() => getMostFrequentEmailDomain(domains, policy), [policy, domains]);

    const data: DomainItem[] = useMemo(() => {
        return domains.map((domain) => ({
            value: domain,
            isSelected: domain === selectedDomain,
            keyForList: domain,
            text: domain,
            rightElement: domain === recommendedDomain ? <Badge text={translate('travel.domainSelector.recommended')} /> : undefined,
        }));
    }, [domains, recommendedDomain, selectedDomain, translate]);

    const handleContinue = () => {
        if (!selectedDomain) {
            return;
        }
        setTravelProvisioningDomain(selectedDomain);
        onNext();
    };

    return (
        <>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mr5, styles.ml5, styles.mb3]}>{translate('travel.domainSelector.headline')}</Text>
            <Text style={[styles.mr5, styles.mb5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text>
            <View style={[styles.optionsListSectionHeader]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('travel.domainSelector.title')}</Text>
            </View>
            <SelectionList
                onSelectRow={(option) => setSelectedDomain(option.value)}
                data={data}
                ListItem={SingleSelectListItem}
                selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.LEFT}
                shouldShowTooltips
                footerContent={
                    <Button
                        isDisabled={!selectedDomain}
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.w100]}
                        onPress={handleContinue}
                    >
                        <Button.Text>{translate('common.next')}</Button.Text>
                    </Button>
                }
            />
        </>
    );
}

export default DomainSelectorStep;
