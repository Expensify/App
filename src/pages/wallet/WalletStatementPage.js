import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import CONFIG from '../../CONFIG';
import WalletStatementModal from '../../components/WalletStatementModal';
import Growl from '../../libs/Growl';
import * as User from '../../libs/actions/User';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import fileDownload from '../../libs/fileDownload';

const propTypes = {
    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({

        /** Each parameter passed via the URL */
        params: PropTypes.shape({

            /** The statement year and month as one string, i.e. 202110 */
            yearMonth: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** Stores details about the statement PDF generation */
    statementPDFData: PropTypes.shape({

        /** Loading state to provide feedback when we are waiting for a request to finish */
        loading: PropTypes.bool,

        /** Error message to inform the user of any problem that might occur */
        error: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    statementPDFData: {
        loading: false,
    },
};

const WalletStatementPage = (props) => {
    moment.locale(lodashGet(props, 'preferredLocale', 'en'));
    const yearMonth = lodashGet(props.route.params, 'yearMonth', null);
    const year = yearMonth.substring(0, 4) || moment().year();
    const month = yearMonth.substring(4) || moment().month();
    const monthName = moment(month, 'M').format('MMMM');
    const title = `${monthName} ${year} statement`;

    const url = `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}statement.php?period=${yearMonth}`;

    const downloadStatementPDF = (period) => {
        if (lodashGet(props, `statementPDFData.periods.${period}`, false)) {
            
        }
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.recapitalize(title)}
                shouldShowDownloadButton
                onCloseButtonPress={() => Navigation.dismissModal(true)}
                onDownloadButtonPress={() => User.getStatementLink(yearMonth)}
            />
            {props.statementPDFData.loading && (
                <FullscreenLoadingIndicator />
            )}
            <WalletStatementModal
                statementPageURL={url}
            />
        </ScreenWrapper>
    );
};

WalletStatementPage.propTypes = propTypes;
WalletStatementPage.defaultProps = defaultProps;
WalletStatementPage.displayName = 'WalletStatementPage';
export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        statementPDFData: {
            key: ONYXKEYS.STATEMENT_LIST,
        },
    }),
)(WalletStatementPage);
