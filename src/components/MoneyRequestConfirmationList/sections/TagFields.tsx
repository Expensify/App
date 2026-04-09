import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTagForDisplay} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import MenuItemWithTopDescription from '../../MenuItemWithTopDescription';

type TagVisibilityItem = {
    shouldShow: boolean;
    isTagRequired: boolean;
};

type TagFieldsProps = {
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;
    tagVisibility: TagVisibilityItem[];
    previousTagsVisibility: boolean[];
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    shouldDisplayTagError: boolean;
    formError: string;

    /** The starting index offset for tag lists, used to compute the correct global tag index for navigation and display */
    tagIndexOffset?: number;
};

function TagFields({
    policyTagLists,
    tagVisibility,
    previousTagsVisibility,
    transaction,
    didConfirm,
    isReadOnly,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    shouldDisplayTagError,
    formError,
    tagIndexOffset = 0,
}: TagFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            {policyTagLists.map(({name}, index) => {
                const globalIndex = tagIndexOffset + index;
                const tagVisibilityItem = tagVisibility.at(index);
                const isTagRequired = tagVisibilityItem?.isTagRequired ?? false;
                const shouldShow = tagVisibilityItem?.shouldShow ?? false;
                const prevShouldShow = previousTagsVisibility.at(index) ?? false;

                if (!shouldShow) {
                    return null;
                }

                return (
                    <MenuItemWithTopDescription
                        highlighted={shouldShow && !getTagForDisplay(transaction, globalIndex) && !prevShouldShow}
                        key={name}
                        shouldShowRightIcon={!isReadOnly}
                        title={getTagForDisplay(transaction, globalIndex)}
                        description={name}
                        shouldShowBasicTitle
                        shouldShowDescriptionOnTop
                        numberOfLinesTitle={2}
                        onPress={() => {
                            if (!transactionID) {
                                return;
                            }

                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, globalIndex, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                        }}
                        style={[styles.moneyRequestMenuItem]}
                        brickRoadIndicator={shouldDisplayTagError && !!getTagForDisplay(transaction, globalIndex) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={shouldDisplayTagError && !!getTagForDisplay(transaction, globalIndex) ? translate(formError as TranslationPaths) : ''}
                        disabled={didConfirm}
                        interactive={!isReadOnly}
                        rightLabel={isTagRequired ? translate('common.required') : ''}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAG_FIELD}
                    />
                );
            })}
        </>
    );
}

export default TagFields;
