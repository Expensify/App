import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getDecodedLeafCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {categoryStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

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
    formError: string;
    shouldNavigateToUpgradePath: boolean;
    shouldSelectPolicy: boolean;
    isEditingSplitBill: boolean;
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
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    isEditingSplitBill,
}: CategoryFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    const categoryState = useTransactionSelector(transactionID, categoryStateSelector, isEditingSplitBill);

    const shouldDisplayCategoryError = formError === 'violations.categoryOutOfPolicy';
    const iouCategory = categoryState?.category ?? '';
    const willAutoFill = categoryState?.willAutoFill ?? false;
    const decodedCategoryName = getDecodedLeafCategoryName(iouCategory);

    const getCategoryRightLabelIcon = () => (willAutoFill ? icons.Sparkles : undefined);
    const getCategoryRightLabel = () => {
        if (willAutoFill) {
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

                const categoryRoute = createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, reportActionID));

                if (shouldNavigateToUpgradePath) {
                    Navigation.navigate(
                        createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_STEP_UPGRADE.getRoute({
                                action,
                                iouType,
                                transactionID,
                                reportID,
                                upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                            }),
                        ),
                    );
                } else if (!policy && shouldSelectPolicy) {
                    Navigation.navigate(ROUTES.SET_DEFAULT_WORKSPACE.getRoute(categoryRoute));
                } else {
                    Navigation.navigate(categoryRoute);
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
