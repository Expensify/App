import React, {useCallback, useMemo, useRef} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearWorkspaceOwnerChangeFlow} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicWorkspaceOwnerChangeSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_SUCCESS>;

function DynamicWorkspaceOwnerChangeSuccessPage({route}: DynamicWorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID) ?? -1;
    const policyID = route.params.policyID;
    const checkBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.path);
    const entryBackPath = useMemo(() => {
        const pathWithoutLeadingSlash = checkBackPath.replaceAll(/^\/+/g, '');
        const match = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash).find((m) => m.pattern === DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.path);
        if (match) {
            return getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, match.actualSuffix, match.pattern);
        }
        return ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID);
    }, [accountID, checkBackPath, policyID]);

    const closePage = useCallback(() => {
        Navigation.goBack(entryBackPath);
        clearWorkspaceOwnerChangeFlow(policyID);
    }, [entryBackPath, policyID]);

    const policy = usePolicy(policyID);
    const shouldShowRef = useRef(!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShowRef.current}
        >
            <ScreenWrapper testID="DynamicWorkspaceOwnerChangeSuccessPage">
                <HeaderWithBackButton
                    title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                    onBackButtonPress={closePage}
                />
                <ConfirmationPage
                    illustration={LottieAnimations.Fireworks}
                    heading={translate('workspace.changeOwner.successTitle')}
                    description={translate('workspace.changeOwner.successDescription')}
                    descriptionStyle={styles.textSupporting}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={closePage}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicWorkspaceOwnerChangeSuccessPage;
