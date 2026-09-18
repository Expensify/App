import Icon from '@components/Icon';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

/**
 * Compact stand-in for the full-width "Add receipt" button, sitting beside the amount field. It opens the same
 * receipt-attachment flow, with the same camera, gallery and file-picker options.
 */
function AddReceiptButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus']);
    const {iouType, transactionID, reportID} = useConfirmationFields();

    return (
        <PressableWithFeedback
            accessibilityLabel={translate('receipt.upload')}
            role={CONST.ROLE.BUTTON}
            style={styles.moneyRequestAddReceiptButton}
            hoverStyle={styles.buttonHoveredBG}
            onPress={() => {
                if (!transactionID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID)));
            }}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ADD_RECEIPT_BUTTON}
        >
            <Icon
                src={icons.ReceiptPlus}
                fill={theme.icon}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </PressableWithFeedback>
    );
}

export default AddReceiptButton;
