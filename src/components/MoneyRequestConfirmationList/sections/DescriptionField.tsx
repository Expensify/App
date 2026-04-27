import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestDescription} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getDescription, hasReceipt} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type DescriptionFieldProps = {
    isNewManualExpenseFlowEnabled: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    isDescriptionRequired: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    isEditingSplitBill: boolean;
};

function DescriptionField({
    isNewManualExpenseFlowEnabled,
    isReadOnly,
    didConfirm,
    isDescriptionRequired,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    policy,
    transaction,
    isEditingSplitBill,
}: DescriptionFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const iouComment = getDescription(transaction);

    const contextMenuStateValue = {
        anchor: null,
        report: undefined,
        isReportArchived: false,
        action: undefined,
        isDisabled: true,
        shouldDisplayContextMenu: false,
    };

    const contextMenuActionsValue = {
        checkIfContextMenuActive: () => {},
        onShowContextMenu: () => {},
    };

    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    const handleDescriptionInputChange = (newDescription: string) => {
        if (!transactionID) {
            return;
        }

        // When editing a split expense, persist directly to the split draft so that
        // SplitBillDetailsPage and completeSplitBill read the latest value.
        // Trimming is deferred to submission time, not during keystrokes, to avoid
        // silently stripping trailing spaces as the user types.
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {comment: newDescription});
            return;
        }

        setMoneyRequestDescription(transactionID, newDescription, true, hasReceipt(transaction));
    };

    return (
        <View>
            <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                    <MentionReportContext.Provider value={mentionReportContextValue}>
                        {isNewManualExpenseFlowEnabled && !isReadOnly ? (
                            <View style={[styles.mh4, styles.mv2]}>
                                <TextInput
                                    value={iouComment ?? ''}
                                    readOnly={didConfirm}
                                    onChangeText={handleDescriptionInputChange}
                                    label={translate('common.description')}
                                    accessibilityLabel={translate('common.description')}
                                    autoGrowHeight
                                    maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                                    type="markdown"
                                    excludedMarkdownStyles={!policy ? ['mentionReport'] : []}
                                />
                            </View>
                        ) : (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon={!isReadOnly}
                                shouldParseTitle
                                excludedMarkdownRules={!policy ? ['reportMentions'] : []}
                                title={iouComment}
                                description={translate('common.description')}
                                onPress={() => {
                                    if (!transactionID) {
                                        return;
                                    }

                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                                    );
                                }}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                                disabled={didConfirm}
                                interactive={!isReadOnly}
                                numberOfLinesTitle={2}
                                rightLabel={isDescriptionRequired ? translate('common.required') : ''}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESCRIPTION_FIELD}
                            />
                        )}
                    </MentionReportContext.Provider>
                </ShowContextMenuActionsContext.Provider>
            </ShowContextMenuStateContext.Provider>
        </View>
    );
}

export default DescriptionField;
