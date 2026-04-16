import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCategory, willFieldBeAutomaticallyFilled} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type CategoryFieldProps = {
    isCategoryRequired: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    formError: string;
    shouldNavigateToUpgradePath: boolean;
    shouldSelectPolicy: boolean;
};

function CategoryField({
    isCategoryRequired,
    didConfirm,
    isReadOnly,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    policy,
    transaction,
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
}: CategoryFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    const shouldDisplayCategoryError = formError === 'violations.categoryOutOfPolicy';
    const iouCategory = getCategory(transaction);
    const decodedCategoryName = getDecodedCategoryName(iouCategory);

    const getCategoryRightLabelIcon = () => (willFieldBeAutomaticallyFilled(transaction, 'category') ? icons.Sparkles : undefined);
    const getCategoryRightLabel = () => {
        if (willFieldBeAutomaticallyFilled(transaction, 'category')) {
            return translate('common.automatic');
        }
        if (isCategoryRequired) {
            return translate('common.required');
        }
        return '';
    };

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={decodedCategoryName}
            description={translate('common.category')}
            numberOfLinesTitle={2}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                if (shouldNavigateToUpgradePath) {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action,
                            iouType,
                            transactionID,
                            reportID,
                            backTo: ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                            upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                        }),
                    );
                } else if (!policy && shouldSelectPolicy) {
                    Navigation.navigate(
                        ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                            ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                        ),
                    );
                } else {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                }
            }}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            disabled={didConfirm}
            interactive={!isReadOnly}
            rightLabel={getCategoryRightLabel()}
            rightLabelIcon={getCategoryRightLabelIcon()}
            brickRoadIndicator={shouldDisplayCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayCategoryError ? translate(formError as TranslationPaths) : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.CATEGORY_FIELD}
        />
    );
}

export default CategoryField;
