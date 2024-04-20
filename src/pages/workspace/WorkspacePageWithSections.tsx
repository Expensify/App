import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy, ReimbursementAccount, User} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
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

        /** Main content of the page */
        children: ((hasVBA: boolean, policyID: string, isUsingECard: boolean) => ReactNode) | ReactNode;

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

        /** Should show the back button. It is used when in RHP. */
        shouldShowBackButton?: boolean;

        /** Whether the offline indicator should be shown in wide screen devices */
        shouldShowOfflineIndicatorInWideScreen?: boolean;

        /** Whether to show this page to non admin policy members */
        shouldShowNonAdmin?: boolean;

        /** Whether to show the not found page */
        shouldShowNotFoundPage?: boolean;

        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;

        /**
         * Icon displayed on the left of the title.
         * If it is passed, the new styling is applied to the component:
         * taller header on desktop and different font of the title.
         * */
        icon?: IconAsset;

        /** Whether the page is loading, example any other API call in progres */
        isLoading?: boolean;
    };

function fetchData(policyID: string, skipVBBACal?: boolean) {
    if (skipVBBACal) {
        return;
    }

    BankAccounts.openWorkspaceView(policyID);
}

function WorkspacePageWithSections({
    backButtonRoute,
    children = () => null,
    footer = null,
    icon = undefined,
    guidesCallTaskID = '',
    headerText,
    policy,
    policyDraft,
    reimbursementAccount = ReimbursementAccountProps.reimbursementAccountDefaultProps,
    route,
    shouldUseScrollView = false,
    shouldSkipVBBACall = false,
    shouldShowBackButton = false,
    user,
    shouldShowLoading = true,
    shouldShowOfflineIndicatorInWideScreen = false,
    shouldShowNonAdmin = false,
    shouldShowNotFoundPage = false,
    isLoading: isPageLoading = false,
}: WorkspacePageWithSectionsProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID ?? '';
    useNetwork({onReconnect: () => fetchData(policyID, shouldSkipVBBACall)});

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isLoading = (reimbursementAccount?.isLoading || isPageLoading) ?? true;
    const achState = reimbursementAccount?.achData?.state ?? '';
    const isUsingECard = user?.isUsingExpensifyCard ?? false;
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const content = typeof children === 'function' ? children(hasVBA, policyID, isUsingECard) : children;
    const {isSmallScreenWidth} = useWindowDimensions();
    const firstRender = useRef(true);
    const isFocused = useIsFocused();
    const prevPolicy = usePrevious(policy);

    useEffect(() => {
        // Because isLoading is false before merging in Onyx, we need firstRender ref to display loading page as well before isLoading is change to true
        firstRender.current = false;
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData(policyID, shouldSkipVBBACall);
        }, [policyID, shouldSkipVBBACall]),
    );

    const shouldShow = useMemo(() => {
        // If the policy object doesn't exist or contains only error data, we shouldn't display it.
        if (((isEmptyObject(policy) || (Object.keys(policy).length === 1 && !isEmptyObject(policy.errors))) && isEmptyObject(policyDraft)) || shouldShowNotFoundPage) {
            return true;
        }

        // We check isPendingDelete for both policy and prevPolicy to prevent the NotFound view from showing right after we delete the workspace
        return (
            (!isEmptyObject(policy) && !PolicyUtils.isPolicyAdmin(policy) && !shouldShowNonAdmin) ||
            (PolicyUtils.isPendingDeletePolicy(policy) && PolicyUtils.isPendingDeletePolicy(prevPolicy))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policy, shouldShowNonAdmin]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={WorkspacePageWithSections.displayName}
            shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen && !shouldShow}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.resetToHome}
                shouldShow={shouldShow}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
            >
                <HeaderWithBackButton
                    title={headerText}
                    guidesCallTaskID={guidesCallTaskID}
                    shouldShowBackButton={isSmallScreenWidth || shouldShowBackButton}
                    onBackButtonPress={() => Navigation.goBack(backButtonRoute)}
                    icon={icon ?? undefined}
                    style={styles.headerBarDesktopHeight}
                />
                {(isLoading || firstRender.current) && shouldShowLoading && isFocused ? (
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
        // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    })(WorkspacePageWithSections),
);
