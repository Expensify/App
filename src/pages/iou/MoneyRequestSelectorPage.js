import {withOnyx} from 'react-native-onyx';
import {Text, View} from 'react-native';
import React, {useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import {compose} from 'underscore';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import ONYXKEYS from '../../ONYXKEYS';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import TabSelector from '../../components/TabSelector';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import * as IOUUtils from '../../libs/IOUUtils';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import MoneyRequestAmountPage from './steps/MoneyRequestAmountPage';
import Styles from '../../styles/styles';
import ReceiptSelector from './ReceiptSelector';
import {PortalHost} from '@gorhom/portal';
import DragAndDrop from '../../components/DragAndDrop';
import Colors from '../../styles/colors';

function MoneyRequestSelectorPage(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const {translate} = useLocalize();

    const isEditing = useRef(lodashGet(props.route, 'path', '').includes('amount'));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const bigPadSelected = useState(true);

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const titleForStep = isEditing.current ? translate('iou.amount') : title[iouType.current];

    const navigateBack = () => {
        Navigation.goBack(isEditing.current ? ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current) : null);
    };

    const selectedTab = lodashGet(props.tabSelected, 'selected', 'manual');
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    return (
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType.current)}>
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDrop
                        dropZoneId={CONST.RECEIPT.DROP_NATIVE_ID}
                        activeDropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
                        onDragEnter={() => {
                            setIsDraggingOver(true);
                            console.log('Receipt selector drag enter');
                        }}
                        onDragLeave={() => {
                            setIsDraggingOver(false);
                            console.log('Receipt selector drag leave');
                        }}
                        onDrop={(e) => {
                            // TODO
                        }}
                    >
                        <View
                            nativeID={CONST.RECEIPT.DROP_NATIVE_ID}
                            style={[styles.flex1, safeAreaPaddingBottomStyle]}
                        >
                            <HeaderWithBackButton
                                title={titleForStep}
                                onBackButtonPress={navigateBack}
                            />
                            <TabSelector />
                            {selectedTab === 'manual' ? (
                                <MoneyRequestAmountPage
                                    route={props.route}
                                    report={props.report}
                                    iou={props.iou}
                                    currentUserPersonalDetails={props.currentUserPersonalDetails}
                                />
                            ) : (
                                <ReceiptSelector
                                    route={props.route}
                                    report={props.report}
                                    iou={props.iou}
                                    isDraggingOver={isDraggingOver}
                                    currentUserPersonalDetails={props.currentUserPersonalDetails}
                                />
                            )}
                            <PortalHost name={CONST.RECEIPT.DROP_HOST_NAME} />
                        </View>
                    </DragAndDrop>
                )}
            </ScreenWrapper>
        </FullPageNotFoundView>
    );
}

// MoneyRequestSelectorPage.propTypes = propTypes;
// MoneyRequestSelectorPage.defaultProps = defaultProps;
MoneyRequestSelectorPage.displayName = 'MoneyRequestSelectorPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
        tabSelected: {key: ONYXKEYS.TAB_SELECTOR},
    }),
)(MoneyRequestSelectorPage);
