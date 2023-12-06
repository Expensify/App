import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import networkPropTypes from '@components/networkPropTypes';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Link from '@userActions/Link';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import WorkspaceReimburseSection from './WorkspaceReimburseSection';

const propTypes = {
    /** Policy values needed in the component */
    policy: PropTypes.shape({
        id: PropTypes.string,
        customUnits: PropTypes.objectOf(
            PropTypes.shape({
                customUnitID: PropTypes.string,
                name: PropTypes.string,
                attributes: PropTypes.shape({
                    unit: PropTypes.string,
                }),
                rates: PropTypes.objectOf(
                    PropTypes.shape({
                        customUnitRateID: PropTypes.string,
                        name: PropTypes.string,
                        rate: PropTypes.number,
                    }),
                ),
            }),
        ),
        outputCurrency: PropTypes.string,
        lastModified: PropTypes.number,
    }).isRequired,

    /** From Onyx */
    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

function WorkspaceReimburseView(props) {
    const styles = useThemeStyles();
    const [currentRatePerUnit, setCurrentRatePerUnit] = useState('');
    const viewAllReceiptsUrl = `expenses?policyIDList=${props.policy.id}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`;
    const distanceCustomUnit = _.find(lodashGet(props.policy, 'customUnits', {}), (unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceCustomRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
    const {translate, toLocaleDigit} = props;

    const getUnitLabel = useCallback((value) => translate(`common.${value}`), [translate]);

    const getCurrentRatePerUnitLabel = useCallback(() => {
        const customUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', '{}'), (rate) => rate && rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const currentUnit = getUnitLabel(lodashGet(distanceCustomUnit, 'attributes.unit', CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES));
        const currentRate = PolicyUtils.getUnitRateValue(customUnitRate, toLocaleDigit);
        const perWord = translate('common.per');
        return `${currentRate} ${perWord} ${currentUnit}`;
    }, [translate, distanceCustomUnit, toLocaleDigit, getUnitLabel]);

    const fetchData = useCallback(() => {
        // Instead of setting the reimbursement account loading within the optimistic data of the API command, use a separate action so that the Onyx value is updated right away.
        // openWorkspaceReimburseView uses API.read which will not make the request until all WRITE requests in the sequential queue have finished responding, so there would be a delay in
        // updating Onyx with the optimistic data.
        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(props.policy.id);
    }, [props.policy.id]);

    useEffect(() => {
        if (props.network.isOffline) {
            return;
        }
        fetchData();
    }, [props.network.isOffline, fetchData]);

    useEffect(() => {
        setCurrentRatePerUnit(getCurrentRatePerUnitLabel());
    }, [props.policy.customUnits, getCurrentRatePerUnitLabel]);

    return (
        <>
            <Section
                title={translate('workspace.reimburse.captureReceipts')}
                icon={Illustrations.MoneyReceipts}
                menuItems={[
                    {
                        title: translate('workspace.reimburse.viewAllReceipts'),
                        onPress: () => Link.openOldDotLink(viewAllReceiptsUrl),
                        icon: Expensicons.Receipt,
                        shouldShowRightIcon: true,
                        iconRight: Expensicons.NewWindow,
                        wrapperStyle: [styles.cardMenuItem],
                        link: () => Link.buildOldDotURL(viewAllReceiptsUrl),
                    },
                ]}
            >
                <View style={[styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>
                        {translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                        <CopyTextToClipboard
                            text={CONST.EMAIL.RECEIPTS}
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                    </Text>
                </View>
            </Section>

            <Section
                title={translate('workspace.reimburse.trackDistance')}
                icon={Illustrations.TrackShoe}
            >
                <View style={[styles.mv3]}>
                    <Text>{translate('workspace.reimburse.trackDistanceCopy')}</Text>
                </View>
                <OfflineWithFeedback
                    pendingAction={lodashGet(distanceCustomUnit, 'pendingAction') || lodashGet(distanceCustomRate, 'pendingAction')}
                    shouldShowErrorMessages={false}
                >
                    <MenuItemWithTopDescription
                        title={currentRatePerUnit}
                        description={translate('workspace.reimburse.trackDistanceRate')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy.id))}
                        wrapperStyle={[styles.mhn5, styles.wAuto]}
                        brickRoadIndicator={(lodashGet(distanceCustomUnit, 'errors') || lodashGet(distanceCustomRate, 'errors')) && CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                </OfflineWithFeedback>
            </Section>

            <WorkspaceReimburseSection
                policy={props.policy}
                reimbursementAccount={props.reimbursementAccount}
                network={props.network}
                translate={translate}
            />
        </>
    );
}

WorkspaceReimburseView.defaultProps = defaultProps;
WorkspaceReimburseView.propTypes = propTypes;
WorkspaceReimburseView.displayName = 'WorkspaceReimburseView';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceReimburseView);
