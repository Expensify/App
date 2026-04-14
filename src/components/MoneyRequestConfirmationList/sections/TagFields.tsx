import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTagForDisplay} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type TagFieldsProps = {
    policyTagList: ValueOf<OnyxTypes.PolicyTagLists>;
    isTagRequired: boolean;
    previousShouldShow: boolean;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
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
};

function TagFields({
    policyTagList,
    isTagRequired,
    previousShouldShow,
    transaction,
    didConfirm,
    isReadOnly,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    formError,
    tagIndex,
}: TagFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldDisplayTagError = formError === 'violations.tagOutOfPolicy';

    return (
        <MenuItemWithTopDescription
            highlighted={!getTagForDisplay(transaction, tagIndex) && !previousShouldShow}
            shouldShowRightIcon={!isReadOnly}
            title={getTagForDisplay(transaction, tagIndex)}
            description={policyTagList.name}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            numberOfLinesTitle={2}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, tagIndex, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
            }}
            style={[styles.moneyRequestMenuItem]}
            brickRoadIndicator={shouldDisplayTagError && !!getTagForDisplay(transaction, tagIndex) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayTagError && !!getTagForDisplay(transaction, tagIndex) ? translate(formError as TranslationPaths) : ''}
            disabled={didConfirm}
            interactive={!isReadOnly}
            rightLabel={isTagRequired ? translate('common.required') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAG_FIELD}
        />
    );
}

export default TagFields;
