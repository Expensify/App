import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TagPicker from '@components/TagPicker';
import tagPropTypes from '@components/tagPropTypes';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {iouDefaultProps, iouPropTypes} from './propTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen via route :iouType/new/tag/:reportID? */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx props */
    /** The report currently being used */
    report: reportPropTypes,

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,
};

const defaultProps = {
    report: {},
    policyTags: {},
    iou: iouDefaultProps,
};

function MoneyRequestTagPage({route, report, policyTags, iou}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const iouType = lodashGet(route, 'params.iouType', '');
    const tagIndex = Number(lodashGet(route, 'params.tagIndex', undefined));
    const policyTagListName = PolicyUtils.getTagListName(policyTags, tagIndex);
    const transactionTag = TransactionUtils.getTag(iou);
    const tag = TransactionUtils.getTag(iou, tagIndex);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report.reportID));
    };

    const updateTag = (selectedTag) => {
        if (tag === selectedTag.searchText) {
            IOU.resetMoneyRequestTag(transactionTag, tagIndex);
        } else {
            IOU.setMoneyRequestTag(transactionTag, selectedTag.searchText, tagIndex);
        }
        navigateBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MoneyRequestTagPage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton
                        title={policyTagListName}
                        onBackButtonPress={navigateBack}
                    />
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: policyTagListName})}</Text>
                    <TagPicker
                        policyID={report.policyID}
                        tag={policyTagListName}
                        tagIndex={tagIndex}
                        selectedTag={tag}
                        insets={insets}
                        onSubmit={updateTag}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestTagPage.displayName = 'MoneyRequestTagPage';
MoneyRequestTagPage.propTypes = propTypes;
MoneyRequestTagPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({route, iou}) => {
                const reportID = IOU.getIOUReportID(iou, route);

                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(MoneyRequestTagPage);
