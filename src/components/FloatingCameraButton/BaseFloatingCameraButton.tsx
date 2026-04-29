import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Icon from '@components/Icon';
import {loadExpensifyIconsChunk} from '@components/Icon/ExpensifyIconLoader';
import {loadIllustrationsChunk} from '@components/Icon/IllustrationLoader';
import {PressableWithoutFeedback} from '@components/Pressable';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getWorkspaceChats} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import Tab from '@userActions/Tab';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type BaseFloatingCameraButtonProps = {
    icon: IconAsset;
};

function BaseFloatingCameraButton({icon}: BaseFloatingCameraButtonProps) {
    const {textLight} = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID} = useCurrentUserPersonalDetails();

    useEffect(() => {
        loadIllustrationsChunk().catch(() => {});
        loadExpensifyIconsChunk().catch(() => {});
    }, []);

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [reportID] = useState(() => generateReportID());

    const policyChatForActivePolicySelector = (reports: OnyxCollection<OnyxTypes.Report>) => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return undefined;
        }
        const policyChatsForActivePolicy = getWorkspaceChats(activePolicyID, [accountID], reports);
        return policyChatsForActivePolicy.at(0);
    };
    const [policyChatForActivePolicy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: policyChatForActivePolicySelector});

    const onPress = () => {
        interceptAnonymousUser(() => {
            if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(activePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                return;
            }

            const quickActionReportID = policyChatForActivePolicy?.reportID ?? reportID;
            Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
            startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatForActivePolicy?.reportID, undefined, true);
        });
    };

    return (
        <PressableWithoutFeedback
            style={[
                styles.navigationTabBarFABItem,
                styles.ph0,
                // Prevent text selection on touch devices (e.g. on long press)
                canUseTouchScreen() && styles.userSelectNone,
                styles.floatingCameraButton,
            ]}
            accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            testID="floating-camera-button"
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_CAMERA_BUTTON}
        >
            <View
                style={styles.floatingActionButton}
                testID="floating-camera-button-container"
            >
                <Icon
                    fill={textLight}
                    src={icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

export default BaseFloatingCameraButton;
