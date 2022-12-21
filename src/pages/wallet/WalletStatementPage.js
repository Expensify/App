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

        this.state = {
            isDownloading: false,
        };
        this.processDownload = this.processDownload.bind(this);
        this.yearMonth = lodashGet(this.props.route.params, 'yearMonth', null);
        this.generatePDFPromise = null;
    }

    componentDidMount() {
        this.generatePDFPromise = makeCancellablePromise(User.generateStatementPDF(this.yearMonth));
    }

    componentWillUnmount() {
        if (!this.generatePDFPromise) {
            return;
        }

        this.generatePDFPromise.cancel();
        this.generatePDFPromise = null;
    }

    processDownload(yearMonth) {
        if (this.state.isDownloading) {
            return;
        }

        this.setState({
            isDownloading: true,
        });

        if (!this.props.walletStatement[yearMonth] || this.props.walletStatement.isGenerating) {
            Growl.show(this.props.translate('common.genericErrorMessage'), CONST.GROWL.ERROR, 5000);
            this.setState({
                isDownloading: false,
            });
        } else {
            const fileName = `Expensify_Statement_${yearMonth}.pdf`;
            const pdfURL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}secure?secureType=pdfreport&filename=${this.props.walletStatement[yearMonth]}&downloadName=${fileName}`;
            fileDownload(pdfURL, fileName).then(() => {
                this.setState({
                    isDownloading: false,
                });
            });
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
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={Str.recapitalize(title)}
                    shouldShowDownloadButton
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                    onDownloadButtonPress={() => this.processDownload(this.yearMonth)}
                />
                <WalletStatementModal
                    statementPageURL={url}
                />
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
)(WalletStatementPage);
