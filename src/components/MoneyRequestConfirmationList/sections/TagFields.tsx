import HighlightableMenuItemWithTopDescription from '@components/HighlightableMenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getCountOfEnabledTagsOfList} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';

import ExpenseFieldDropdown from './ExpenseFieldDropdown';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import {createTagDisplaySelector} from './selectors';
import TagFieldDropdown from './TagFieldDropdown';
import useFieldRowHighlightStyle from './useFieldRowHighlightStyle';
import useTransactionSelector from './useTransactionSelector';

type TagFieldsProps = {
    policyTagList: ValueOf<OnyxTypes.PolicyTagLists>;
    isTagRequired: boolean;
    previousShouldShow: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    formError: string;

    /** The global tag index used for navigation and display */
    tagIndex: number;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether each tag level's options depend on the level above */
    hasDependentTags: boolean;
};

function TagFields({
    policyTagList,
    isTagRequired,
    previousShouldShow,
    didConfirm,
    isReadOnly,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    formError,
    tagIndex,
    policy,
    hasDependentTags,
}: TagFieldsProps) {
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {isEditingSplitBill} = useConfirmationFields();
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldDisplayTagError = formError === 'violations.tagOutOfPolicy';

    const tagDisplaySelector = createTagDisplaySelector(tagIndex);
    const tagDisplay = useTransactionSelector(transactionID, tagDisplaySelector);

    const displayedTag = tagDisplay ?? '';
    const shouldHighlight = !displayedTag && !previousShouldShow;
    const highlightStyle = useFieldRowHighlightStyle(shouldUseDropdownRows && shouldHighlight);

    const canSaveFromThisForm = action !== CONST.IOU.ACTION.EDIT || isEditingSplitBill;
    const isCreatingExpense = action === CONST.IOU.ACTION.CREATE;
    const canShowTags = isCreatingExpense || getCountOfEnabledTagsOfList(policyTagList.tags) > 0;
    const shouldOpenInDropdown = isBetaEnabled(CONST.BETAS.ANCHORED_FIELD_DROPDOWNS) && !!transactionID && !!policy && canSaveFromThisForm && !hasDependentTags && canShowTags;

    const openTagPage = () => {
        if (!transactionID) {
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, tagIndex, transactionID, reportID, reportActionID)));
    };

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldDropdown
                backgroundStyle={highlightStyle}
                name={policyTagList.name}
                value={displayedTag}
                numberOfLinesValue={2}
                rightLabel={isTagRequired ? translate('common.required') : ''}
                errorText={shouldDisplayTagError && !!displayedTag ? translate(formError as TranslationPaths) : ''}
                onPress={openTagPage}
                shouldOpenInDropdown={shouldOpenInDropdown && !isReadOnly && !didConfirm}
                listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                renderDropdown={(dropdownProps) =>
                    !!transactionID && (
                        <TagFieldDropdown
                            {...dropdownProps}
                            transactionID={transactionID}
                            policy={policy}
                            tagListIndex={tagIndex}
                        />
                    )
                }
                isDisabled={didConfirm}
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAG_FIELD}
            />
        );
    }

    return (
        <HighlightableMenuItemWithTopDescription
            highlighted={shouldHighlight}
            shouldShowRightIcon={!isReadOnly}
            title={displayedTag}
            description={policyTagList.name}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            numberOfLinesTitle={2}
            onPress={openTagPage}
            style={[styles.moneyRequestMenuItem]}
            brickRoadIndicator={shouldDisplayTagError && !!displayedTag ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayTagError && !!displayedTag ? translate(formError as TranslationPaths) : ''}
            disabled={didConfirm}
            interactive={!isReadOnly}
            rightLabel={isTagRequired ? translate('common.required') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAG_FIELD}
        />
    );
}

export default TagFields;
