import type {RouteProp} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy, ReimbursementAccount, User} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspacePageWithSectionsOnyxProps = {
    /** From Onyx */
    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** User Data from Onyx */
    user: OnyxEntry<User>;
};

type WorkspacePageWithSectionsProps = WithPolicyAndFullscreenLoadingProps &
    WorkspacePageWithSectionsOnyxProps & {
        shouldSkipVBBACall?: boolean;

        /** The text to display in the header */
        headerText: string;

        /** The route object passed to this page from the navigator */
        route: RouteProp<{params: {policyID: string}}>;

        /** Main content of the page */
        children: (hasVBA?: boolean, policyID?: string, isUsingECard?: boolean) => ReactNode;

        /** Content to be added as fixed footer */
        footer?: ReactNode;

        /** The guides call task ID to associate with the workspace page being shown */
        guidesCallTaskID: string;

        /** The route where we navigate when the user press the back button */
        backButtonRoute?: Route;

        /** Option to use the default scroll view  */
        shouldUseScrollView?: boolean;

        /** Option to show the loading page while the API is calling */
        shouldShowLoading?: boolean;

        shouldShowOfflineIndicatorInWideScreen?: boolean;

        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;
    };

function fetchData(skipVBBACal?: boolean) {
    if (skipVBBACal) {
        return;
    }

    BankAccounts.openWorkspaceView();
}

function WorkspacePageWithSections({
    backButtonRoute = '',
    children = () => null,
    footer = null,
    guidesCallTaskID = '',
    headerText,
    policy,
    reimbursementAccount = ReimbursementAccountProps.reimbursementAccountDefaultProps,
    route,
    shouldUseScrollView = false,
    shouldSkipVBBACall = false,
    user,
    shouldShowLoading = true,
    shouldShowOfflineIndicatorInWideScreen = false,
}: WorkspacePageWithSectionsProps) {
    const styles = useThemeStyles();
    useNetwork({onReconnect: () => fetchData(shouldSkipVBBACall)});

    const isLoading = reimbursementAccount?.isLoading ?? true;
    const isOverview = route.name;
    const achState = reimbursementAccount?.achData?.state ?? '';
    const isUsingECard = user?.isUsingExpensifyCard ?? false;
    const policyID = route.params.policyID;
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const content = children(hasVBA, policyID, isUsingECard);
    const {isSmallScreenWidth} = useWindowDimensions();
    const firstRender = useRef(true);

    const goBack = () => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);

    useEffect(() => {
        // Because isLoading is false before merging in Onyx, we need firstRender ref to display loading page as well before isLoading is change to true
        firstRender.current = false;
    }, []);

    useEffect(() => {
        fetchData(shouldSkipVBBACall);
    }, [shouldSkipVBBACall]);

    const shouldShow = useMemo(() => {
        if (isEmptyObject(policy)) {
            return true;
        }

        // TODO - check is the value of isOveriew is correct
        return !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !isOverview;
    }, [isOverview, policy]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={WorkspacePageWithSections.displayName}
            shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen}
        >
            <FullPageNotFoundView
                onBackButtonPress={goBack}
                onLinkPress={goBack}
                shouldShow={shouldShow}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
            >
                <HeaderWithBackButton
                    title={headerText}
                    guidesCallTaskID={guidesCallTaskID}
                    shouldShowBackButton={isSmallScreenWidth}
                    onBackButtonPress={() => Navigation.goBack(backButtonRoute ?? ROUTES.WORKSPACE_INITIAL.getRoute(policyID))}
                />
                {(isLoading || firstRender.current) && shouldShowLoading ? (
                    <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <>
                        {shouldUseScrollView ? (
                            <ScrollViewWithContext
                                keyboardShouldPersistTaps="handled"
                                style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                            >
                                <View style={[styles.w100, styles.flex1]}>{content}</View>
                            </ScrollViewWithContext>
                        ) : (
                            content
                        )}
                        {footer}
                    </>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspacePageWithSections.displayName = 'WorkspacePageWithSections';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspacePageWithSectionsProps, WorkspacePageWithSectionsOnyxProps>({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    })(WorkspacePageWithSections),
);
