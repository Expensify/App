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
import * as User from '../../libs/actions/User';
import fileDownload from '../../libs/fileDownload';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import makeCancellablePromise from '../../libs/MakeCancellablePromise';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({

        /** Each parameter passed via the URL */
        params: PropTypes.shape({

            /** The statement year and month as one string, i.e. 202110 */
            yearMonth: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    walletStatement: PropTypes.shape({
        /** Whether the PDF file available for download or not */
        isGenerating: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletStatement: {
        isGenerating: false,
    },
};

class WalletStatementPage extends React.Component {
    constructor(props) {
        super(props);

        this.processDownload = this.processDownload.bind(this);
        this.yearMonth = lodashGet(this.props.route.params, 'yearMonth', null);
    }

    processDownload(yearMonth) {
        if (!this.props.walletStatement[yearMonth] && !this.props.walletStatement.isGenerating) {
            Growl.show(this.props.translate('statementPage.generatingPDF'), CONST.GROWL.NOTICE, 5000);
            User.generateStatementPDF(this.yearMonth);
        } else {
            const fileName = `Expensify_Statement_${yearMonth}.pdf`;
            const pdfURL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}secure?secureType=pdfreport&filename=${this.props.walletStatement[yearMonth]}&downloadName=${fileName}`;
            fileDownload(pdfURL, fileName);
        }
    }

    render() {
        moment.locale(lodashGet(this.props, 'preferredLocale', 'en'));
        const year = this.yearMonth.substring(0, 4) || moment().year();
        const month = this.yearMonth.substring(4) || moment().month();
        const monthName = moment(month, 'M').format('MMMM');
        const title = `${monthName} ${year} statement`;
        const url = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}statement.php?period=${this.yearMonth}`;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={Str.recapitalize(title)}
                    shouldShowDownloadButton={!this.props.network.isOffline || this.props.walletStatement.isGenerating}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                    onDownloadButtonPress={() => this.processDownload(this.yearMonth)}
                />
                <FullPageOfflineBlockingView>
                    <WalletStatementModal
                        statementPageURL={url}
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }
}

WalletStatementPage.propTypes = propTypes;
WalletStatementPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        walletStatement: {
            key: ONYXKEYS.WALLET_STATEMENT,
        },
    }),
    withNetwork(),
)(WalletStatementPage);
