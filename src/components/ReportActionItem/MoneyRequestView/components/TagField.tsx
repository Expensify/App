import HighlightableMenuItemWithTopDescription from '@components/HighlightableMenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {shouldShowDependentTagList} from '@libs/TagsOptionsListUtils';
import {getTagForDisplay} from '@libs/TransactionUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type TagFieldProps = {
    data: MoneyRequestViewData;
};

function TagField({data}: TagFieldProps) {
    return data.policyTagLists.map(({name, orderWeight, tags}, index) => {
        const tagForDisplay = getTagForDisplay(data.updatedTransaction ?? data.transaction, index);
        let shouldShow = false;
        if (data.hasDependentTags) {
            shouldShow = shouldShowDependentTagList(index, data.transactionTag, tags);
        } else {
            shouldShow = !!tagForDisplay || (data.canEdit && hasEnabledOptions(tags));
        }

        if (!shouldShow) {
            return null;
        }

        const tagError = data.getErrorForField(
            'tag',
            {
                tagListIndex: index,
                tagListName: name,
            },
            data.hasDependentTags,
            tagForDisplay,
        );
        const tagCopyValue = !data.canEdit ? tagForDisplay : undefined;

        return (
            <OfflineWithFeedback
                key={name}
                pendingAction={data.getPendingFieldAction('tag')}
            >
                <HighlightableMenuItemWithTopDescription
                    highlighted={data.hasDependentTags && shouldShow && !getTagForDisplay(data.transaction, index) && data.currentTagLength > data.previousTagLength}
                    description={name ?? data.translate('common.tag')}
                    title={tagForDisplay}
                    numberOfLinesTitle={2}
                    interactive={data.canEdit}
                    shouldShowRightIcon={data.canEdit}
                    titleStyle={data.styles.flex1}
                    onPress={() => {
                        if (!data.transaction?.transactionID || !data.transactionThreadReport?.reportID) {
                            return;
                        }
                        if (data.shouldShowTagDisabledAlert) {
                            data.showTagDisabledAlert(index);
                            return;
                        }
                        Navigation.navigate(
                            createDynamicRoute(
                                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    data.iouType,
                                    orderWeight,
                                    data.transaction.transactionID,
                                    data.transactionThreadReport.reportID,
                                ),
                            ),
                        );
                    }}
                    brickRoadIndicator={tagError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={tagError}
                    shouldShowBasicTitle
                    shouldShowDescriptionOnTop
                    copyValue={tagCopyValue}
                    copyable={!!tagCopyValue}
                />
            </OfflineWithFeedback>
        );
    });
}

TagField.displayName = 'TagField';

export default TagField;
