import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';

import {setTravelProvisioningEnabledSteps} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import {areTravelPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {getAdminsPrivateEmailDomains, isNonUSDPolicy, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, Policy, PrivatePersonalDetails, TravelProvisioning} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {EnableTravelSubPageProps} from './types';

import DomainSelectorStep from './subPages/DomainSelectorStep';
import LegalNameStep from './subPages/LegalNameStep';
import TaxIDStep from './subPages/TaxIDStep';
import TermsStep from './subPages/TermsStep';
import VerifyAccountStep from './subPages/VerifyAccountStep';
import WorkspaceAddressStep from './subPages/WorkspaceAddressStep';

const STEP_COMPONENT_BY_PAGE_NAME: Record<string, typeof LegalNameStep> = {
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.LEGAL_NAME]: LegalNameStep,
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.VERIFY_ACCOUNT]: VerifyAccountStep,
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.DOMAIN_SELECTOR]: DomainSelectorStep,
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.WORKSPACE_ADDRESS]: WorkspaceAddressStep,
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.LEGAL_ENTITY_TAX_ID]: TaxIDStep,
    [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS]: TermsStep,
};

type EnableTravelContentProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    account: OnyxEntry<Account>;
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    travelProvisioning: OnyxEntry<TravelProvisioning>;
};

function EnableTravelContent({policy, policyID, account, privatePersonalDetails, travelProvisioning}: EnableTravelContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isProvisioned = isWorkspaceProvisionedForTravel(policy?.travelSettings);
    const adminDomains = getAdminsPrivateEmailDomains(policy);
    const isUserValidated = account?.validated ?? false;
    const legalNameMissing = areTravelPersonalDetailsMissing(privatePersonalDetails);
    const needsVerify = !isUserValidated;
    const needsDomainSelector = !isProvisioned && adminDomains.length > 1;
    const needsAddress = !isProvisioned && isEmptyObject(policy?.address);
    const needsTaxID = isNonUSDPolicy(policy) && !isProvisioned && !policy?.travelSettings?.taxID;

    const resolvedDomain = useMemo(() => {
        if (isProvisioned) {
            return CONST.TRAVEL.DEFAULT_DOMAIN;
        }
        if (adminDomains.length === 1) {
            return adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN;
        }
        return travelProvisioning?.domain ?? CONST.TRAVEL.DEFAULT_DOMAIN;
    }, [isProvisioned, adminDomains, travelProvisioning?.domain]);

    // Each step of this flow is a separate navigation push (a fresh mount of this component, not an in-place
    // update), and completing a step (e.g. saving the legal name) flips the very Onyx flag that decided whether
    // that step was included. So the step list can't just be frozen in local component state — it has to be
    // computed once per flow session and persisted to TRAVEL_PROVISIONING (cleared by BookTravelButton at the
    // start of every fresh session), or the total step count would shrink out from under the user as they
    // move between steps, and going back would land on a mount with a mismatched step list.
    const persistedEnabledSteps = travelProvisioning?.enabledSteps;
    const [enabledStepNames] = useState<string[]>(() => {
        if (persistedEnabledSteps) {
            return persistedEnabledSteps;
        }
        const nextEnabledStepNames: string[] = [];
        if (legalNameMissing) {
            nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.LEGAL_NAME);
        }
        if (needsVerify) {
            nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.VERIFY_ACCOUNT);
        }
        if (needsDomainSelector) {
            nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.DOMAIN_SELECTOR);
        }
        if (needsAddress) {
            nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.WORKSPACE_ADDRESS);
        }
        if (needsTaxID) {
            nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.LEGAL_ENTITY_TAX_ID);
        }
        nextEnabledStepNames.push(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS);
        return nextEnabledStepNames;
    });

    useEffect(() => {
        if (persistedEnabledSteps) {
            return;
        }
        setTravelProvisioningEnabledSteps(enabledStepNames);
        // Persist once for this mount only — later flag changes (e.g. legal name getting saved) shouldn't
        // re-trigger this, since enabledStepNames is already frozen for the rest of this flow session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pages = useMemo(() => enabledStepNames.map((pageName) => ({pageName, component: STEP_COMPONENT_BY_PAGE_NAME[pageName] ?? TermsStep})), [enabledStepNames]);

    const stepNames = enabledStepNames;

    const startFrom = account === undefined ? -1 : 0;

    const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, moveTo, isRedirecting} = useSubPage<EnableTravelSubPageProps>({
        pages,
        startFrom,
        onFinished: () => Navigation.closeRHPFlow(),
        buildRoute: (pageName, action) => ROUTES.TRAVEL_ENABLE.getRoute(policyID, pageName, action),
    });

    if (isRedirecting) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'EnableTravelContent', isRedirecting};
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(ROUTES.TRAVEL_ENABLE.getRoute(policyID, CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS));
            return;
        }
        if (pageIndex === 0) {
            Navigation.closeRHPFlow();
            return;
        }
        prevPage();
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="EnableTravelContent"
        >
            <HeaderWithBackButton
                title={translate('travel.bookTravel')}
                onBackButtonPress={handleBackButtonPress}
            />
            {stepNames.length >= 2 && (
                <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                    <InteractiveStepSubPageHeader
                        stepNames={stepNames}
                        currentStepIndex={pageIndex}
                        currentStepAccessibilityDescription={translate('travel.bookTravel')}
                        onStepSelected={moveTo}
                    />
                </View>
            )}
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                policy={policy}
                policyID={policyID}
                resolvedDomain={resolvedDomain}
            />
        </ScreenWrapper>
    );
}

export default EnableTravelContent;
