import {Str} from 'expensify-common';
import React, {useEffect, useMemo, useState} from 'react';
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function DomainSelectorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [selectedDomain, setSelectedDomain] = useState('');

    const data: DomainItem[] = useMemo(() => {
        return [
            ...new Set(
                Object.entries(activePolicy?.employeeList ?? {})
                    .filter(([_, employee]) => employee.role === CONST.POLICY.ROLE.ADMIN)
                    .map(([email, _]) => Str.extractEmailDomain(email).toLowerCase()),
            ),
        ].map((domain) => {
            return {
                value: domain,
                isSelected: domain === selectedDomain,
                keyForList: domain,
                text: domain,
                isRecommended: domain === 'domain.com',
            };
        });
    }, [activePolicy, selectedDomain]);

    const footerContent = useMemo(
        () => (
            <Button
                isDisabled={selectedDomain.length <= 0}
                success
                large
                style={[styles.w100]}
                onPress={() => Navigation.navigate(ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO)}
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
