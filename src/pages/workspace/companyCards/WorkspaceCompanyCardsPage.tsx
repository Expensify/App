import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
// import Onyx from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
// import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
// import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policyID = route.params.policyID;
    // const policy = usePolicy(policyID);
    // const workspaceAccountID = policy?.workspaceAccountID ?? -1;

    // useEffect(() => {
    //     Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`, {
    //         companyCards: {
    //             cdfbmo: {
    //                 pending: false,
    //                 asrEnabled: true,
    //                 forceReimbursable: 'force_no',
    //                 liabilityType: 'corporate',
    //                 preferredPolicy: '',
    //                 reportTitleFormat: '{report:card}{report:bank}{report:submit:from}{report:total}{report:enddate:MMMM}',
    //                 statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
    //             },
    //         },
    //         companyCardNicknames: {
    //             cdfbmo: 'BMO MasterCard',
    //         },
    //     });
    // }, [workspaceAccountID]);

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                medium
                success
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID))}
                icon={Expensicons.Plus}
                text={translate('workspace.moreFeatures.companyCards.assignCard')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
            <Button
                medium
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID))}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
        </View>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                icon={Illustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
                shouldShowOfflineIndicatorInWideScreen
                headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            >
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]} />
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
