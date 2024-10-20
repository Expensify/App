import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspacePageWithSectionsProps = WithPolicyAndFullscreenLoadingProps &
    Pick<HeaderWithBackButtonProps, 'shouldShowThreeDotsButton' | 'threeDotsMenuItems' | 'threeDotsAnchorPosition' | 'shouldShowBackButton' | 'onBackButtonPress'> & {
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

        /** Whether the offline indicator should be shown in wide screen devices */
        shouldShowOfflineIndicatorInWideScreen?: boolean;

        /** Whether to show this page to non admin policy members */
        shouldShowNonAdmin?: boolean;

        /** Whether to show the not found page */
        shouldShowNotFoundPage?: boolean;

        /** Whether to include safe area padding bottom or not */
        includeSafeAreaPaddingBottom?: boolean;

        /** Makes firstRender ref display loading page before isLoading is change to true */
        showLoadingAsFirstRender?: boolean;

        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;

        /**
         * Icon displayed on the left of the title.
         * If it is passed, the new styling is applied to the component:
         * taller header on desktop and different font of the title.
         * */
        icon?: IconAsset;

        /** Content to be added to the header */
        headerContent?: ReactNode;

        /** TestID of the component */
        testID?: string;

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
    route,
    shouldUseScrollView = false,
    showLoadingAsFirstRender = true,
    shouldSkipVBBACall = true,
    shouldShowBackButton = false,
    shouldShowLoading = true,
    shouldShowOfflineIndicatorInWideScreen = false,
    includeSafeAreaPaddingBottom = false,
    shouldShowNonAdmin = false,
    headerContent,
    testID,
    shouldShowNotFoundPage = false,
    isLoading: isPageLoading = false,
    onBackButtonPress,
    shouldShowThreeDotsButton,
    threeDotsMenuItems,
    threeDotsAnchorPosition,
}: WorkspacePageWithSectionsProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID ?? '-1';
    useNetwork({onReconnect: () => fetchData(policyID, shouldSkipVBBACall)});

    const [user] = useOnyx(ONYXKEYS.USER);
    const [reimbursementAccount = CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isLoading = (reimbursementAccount?.isLoading || isPageLoading) ?? true;
    const achState = reimbursementAccount?.achData?.state ?? '-1';
    const isUsingECard = user?.isUsingExpensifyCard ?? false;
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const content = typeof children === 'function' ? children(hasVBA, policyID, isUsingECard) : children;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const firstRender = useRef(showLoadingAsFirstRender);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy, shouldShowNonAdmin]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={testID ?? WorkspacePageWithSections.displayName}
            shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen && !shouldShow}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goUp(ROUTES.SETTINGS_WORKSPACES)}
                onLinkPress={() => Navigation.goUp(ROUTES.HOME)}
                shouldShow={shouldShow}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
            >
                <HeaderWithBackButton
                    title={headerText}
                    guidesCallTaskID={guidesCallTaskID}
                    onBackButtonPress={() => (onBackButtonPress ? onBackButtonPress() : Navigation.goBack(backButtonRoute))}
                    shouldShowBackButton={shouldUseNarrowLayout || shouldShowBackButton}
                    icon={icon ?? undefined}
                    style={styles.headerBarDesktopHeight}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={threeDotsAnchorPosition}
                >
                    {headerContent}
                </HeaderWithBackButton>
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

export default withPolicyAndFullscreenLoading(WorkspacePageWithSections);
