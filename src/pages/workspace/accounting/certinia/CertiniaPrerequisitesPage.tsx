import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAuthenticationError} from '@libs/actions/connections';
import {connectPolicyToFinancialForce} from '@libs/actions/connections/FinancialForce';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import CertiniaPrerequisitesStep from './prerequisites/CertiniaPrerequisitesStep';

type CertiniaPrerequisitesStepExtraProps = SubPageProps & {
    onConnect: () => void;
};

type CertiniaPrerequisitesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_PREREQUISITES>;

const pages = [
    {pageName: CONST.CERTINIA_PREREQUISITES.PAGE_NAME.INSTALL_BUNDLE, component: CertiniaPrerequisitesStep},
    {pageName: CONST.CERTINIA_PREREQUISITES.PAGE_NAME.SETUP_CONTACTS, component: CertiniaPrerequisitesStep},
    {pageName: CONST.CERTINIA_PREREQUISITES.PAGE_NAME.OAUTH, component: CertiniaPrerequisitesStep},
];

function CertiniaPrerequisitesPage({route}: CertiniaPrerequisitesPageProps) {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const policyID: string = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const config = policy?.connections?.financialforce?.config;
    const shouldBeBlocked = !!config?.isConfigured && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.CERTINIA);

    const handleConnect = () => {
        connectPolicyToFinancialForce(policyID, false, environmentURL);
        Navigation.dismissModal();
    };

    const {CurrentPage, nextPage, prevPage, pageIndex, moveTo, currentPageName} = useSubPage<CertiniaPrerequisitesStepExtraProps>({
        pages,
        onFinished: handleConnect,
        buildRoute: (pageName) => ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID, pageName),
    });

    const handleBackButtonPress = () => {
        if (pageIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevPage();
    };

    return (
        <ConnectionLayout
            displayName="CertiniaPrerequisitesPage"
            headerTitle="workspace.certinia.prerequisites.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            onBackButtonPress={handleBackButtonPress}
            shouldBeBlocked={shouldBeBlocked}
            shouldLoadForEmptyConnection
            shouldUseScrollView={false}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubPageHeader
                    currentStepIndex={pageIndex}
                    stepNames={CONST.CERTINIA_PREREQUISITES.STEP_INDEX_LIST}
                    onStepSelected={moveTo}
                />
            </View>
            <CurrentPage
                isEditing={false}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                onConnect={handleConnect}
            />
        </ConnectionLayout>
    );
}

export default CertiniaPrerequisitesPage;
