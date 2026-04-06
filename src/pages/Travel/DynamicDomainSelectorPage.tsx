import type {StackScreenProps} from '@react-navigation/stack';
import {isUserValidatedSelector} from '@selectors/Account';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TravelDomainListItem from '@components/SelectionList/ListItem/TravelDomainListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanupTravelProvisioningSession, setTravelProvisioningNextStep} from '@libs/actions/Travel';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import {getAdminsPrivateEmailDomains, getMostFrequentEmailDomain} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type DomainItem = ListItem & {
    value: string;
    isRecommended: boolean;
};

type DynamicDomainSelectorPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DYNAMIC_DOMAIN_SELECTOR>;

function DynamicDomainSelectorPage({route}: DynamicDomainSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    const [selectedDomain, setSelectedDomain] = useState<string | undefined>();

    const domains = useMemo(() => getAdminsPrivateEmailDomains(policy), [policy]);
    const recommendedDomain = useMemo(() => getMostFrequentEmailDomain(domains, policy), [policy, domains]);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_DOMAIN_SELECTOR.path);

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

    const provisionTravelForDomain = () => {
        const domain = selectedDomain ?? CONST.TRAVEL.DEFAULT_DOMAIN;
        const activeRouteParams = new URLSearchParams(Navigation.getActiveRoute().split('?').at(1));
        const travelTCSRoute = activeRouteParams.has('policyID') ? DYNAMIC_ROUTES.TRAVEL_TCS.getRoute(domain) : DYNAMIC_ROUTES.TRAVEL_TCS.getRoute(domain, policyID);

        // Always validate OTP first before proceeding to address details or terms acceptance
        if (!isUserValidated) {
            // Determine where to redirect after OTP validation
            const nextStep = isEmptyObject(policy?.address) ? ROUTES.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, policyID, Navigation.getActiveRoute()) : createDynamicRoute(travelTCSRoute);
            setTravelProvisioningNextStep(nextStep);
            Navigation.navigate(ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(domain, policyID));
            return;
        }
        if (isEmptyObject(policy?.address)) {
            // Spotnana requires an address anytime an entity is created for a policy
            Navigation.navigate(ROUTES.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, policyID, Navigation.getActiveRoute()));
        } else {
            cleanupTravelProvisioningSession();
            Navigation.navigate(createDynamicRoute(travelTCSRoute));
        }
    };

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="DomainSelectorPage"
            >
                <HeaderWithBackButton
                    title={translate('travel.domainSelector.title')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
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
                            success
                            large
                            style={[styles.w100]}
                            onPress={provisionTravelForDomain}
                            text={translate('common.continue')}
                        />
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicDomainSelectorPage;
