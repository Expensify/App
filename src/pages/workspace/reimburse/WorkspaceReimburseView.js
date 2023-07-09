import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import Navigation from '../../../libs/Navigation/Navigation';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';
import compose from '../../../libs/compose';
import * as Policy from '../../../libs/actions/Policy';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import usePrevious from '../../../hooks/usePrevious';
import * as ReimbursementAccountProps from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import WorkspaceReimburseSection from './WorkspaceReimburseSection';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';

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
    const [currentRatePerUnit, setCurrentRatePerUnit] = useState('');
    const prevIsOffline = usePrevious(props.network.isOffline);
    const viewAllReceiptsUrl = `expenses?policyIDList=${props.policy.id}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`;
    const distanceCustomUnit = _.find(lodashGet(props.policy, 'customUnits', {}), (unit) => unit.name === 'Distance');
    const distanceCustomRate = _.find(lodashGet(props.distanceCustomUnit, 'rates', {}), (rate) => rate.name === 'Default Rate');

    const getNumericValue = useCallback(
        (value) => {
            const propsToLocaleDigit = props.toLocaleDigit;
            const numValue = parseFloat(value.toString().replace(propsToLocaleDigit('.'), '.'));
            if (Number.isNaN(numValue)) {
                return NaN;
            }
            return numValue.toFixed(3);
        },
        [props.toLocaleDigit],
    );

    const getRateDisplayValue = useCallback(
        (value) => {
            const propsToLocaleDigit = props.toLocaleDigit;
            const numValue = getNumericValue(value);
            if (Number.isNaN(numValue)) {
                return '';
            }
            return numValue.toString().replace('.', propsToLocaleDigit('.')).substring(0, value.length);
        },
        [getNumericValue, props.toLocaleDigit],
    );

    const getRateLabel = useCallback((customUnitRate) => getRateDisplayValue(lodashGet(customUnitRate, 'rate', 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET), [getRateDisplayValue]);

    const getUnitLabel = useCallback(
        (value) => {
            const propsTranslate = props.translate;
            return propsTranslate(`common.${value}`);
        },
        [props.translate],
    );

    const getCurrentRatePerUnitLabel = useCallback(() => {
        const propsTranslate = props.translate;
        const customUnitRate = _.find(distanceCustomUnit && distanceCustomUnit.rates, (rate) => rate && rate.name === 'Default Rate');
        const currentUnit = getUnitLabel((distanceCustomUnit && distanceCustomUnit.attributes && distanceCustomUnit.attributes.unit) || 'mi');
        const currentRate = getRateLabel(customUnitRate);
        const perWord = propsTranslate('common.per');
        return `${currentRate} ${perWord} ${currentUnit}`;
    }, [props.translate, distanceCustomUnit, getUnitLabel, getRateLabel]);

    const fetchData = useCallback(() => {
        // Instead of setting the reimbursement account loading within the optimistic data of the API command, use a separate action so that the Onyx value is updated right away.
        // openWorkspaceReimburseView uses API.read which will not make the request until all WRITE requests in the sequential queue have finished responding, so there would be a delay in
        // updating Onyx with the optimistic data.
        const propsPolicyId = props.policy.id;
        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(propsPolicyId);
    }, [props.policy.id]);

    useEffect(() => {
        setCurrentRatePerUnit(getCurrentRatePerUnitLabel());
        const isReconnecting = prevIsOffline && !props.network.isOffline;
        if (!isReconnecting) {
            return;
        }
        fetchData();
    }, [props.policy.customUnits, props.preferredLocale, props.network.isOffline, prevIsOffline, getCurrentRatePerUnitLabel, fetchData]);

    return (
        <>
            <Section
                title={props.translate('workspace.reimburse.captureReceipts')}
                icon={Illustrations.MoneyReceipts}
                menuItems={[
                    {
                        title: props.translate('workspace.reimburse.viewAllReceipts'),
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
                    <Text numberOfLines={100}>
                        {props.translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                        <CopyTextToClipboard
                            text="receipts@expensify.com"
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{props.translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                    </Text>
                </View>
            </Section>

            <Section
                title={props.translate('workspace.reimburse.trackDistance')}
                icon={Illustrations.TrackShoe}
            >
                <View style={[styles.mv3]}>
                    <Text>{props.translate('workspace.reimburse.trackDistanceCopy')}</Text>
                </View>
                <OfflineWithFeedback
                    pendingAction={lodashGet(distanceCustomUnit, 'pendingAction') || lodashGet(distanceCustomRate, 'pendingAction')}
                    shouldShowErrorMessages={false}
                >
                    <MenuItemWithTopDescription
                        title={currentRatePerUnit}
                        description={props.translate('workspace.reimburse.trackDistanceRate')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.getWorkspaceRateAndUnitRoute(props.policy.id))}
                        wrapperStyle={[styles.mhn5, styles.wAuto]}
                        brickRoadIndicator={(lodashGet(distanceCustomUnit, 'errors') || lodashGet(distanceCustomRate, 'errors')) && CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                </OfflineWithFeedback>
            </Section>

            <WorkspaceReimburseSection
                policy={props.policy}
                reimbursementAccount={props.reimbursementAccount}
                network={props.network}
                translate={props.translate}
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
