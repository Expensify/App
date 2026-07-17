
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { confirmPayment } from 'src/libs/actions/Payments';
import { withOnyx } from 'src/libs/onyx';
import { withLocalize } from 'react-localize-redux';
import { translate } from 'react-localize-redux';

import ActionCell from './ActionCell';

const PayActionCell: React.FC<PayActionCellProps> = ({
  report,
  chatReport,
  policy,
  vbbaBankAccountList,
  ...props
}) => {
  const dispatch = useDispatch();
  const { translate } = useLocalize();

  const confirmPaymentHandler = useCallback(() => {
    const { reportID, amount } = report;
    const bankAccountID = vbbaBankAccountList.length > 0 ? vbbaBankAccountList[0].id : null;

    if (!chatReport || !reportID || !amount || !bankAccountID) {
      return; // Early return if necessary data is missing
    }

    dispatch(confirmPayment(reportID, amount, bankAccountID));
  }, [dispatch, report, chatReport, vbbaBankAccountList]);

  return (
    <ActionCell
      {...props}
      action="PAY"
      label={translate('reportList.pay')}
      onClick={confirmPaymentHandler}
    />
  );
};

export default withOnyx({
  vbbaBankAccountList: {
    key: 'vbbaBankAccountList',
    selector: () => [],
  },
  chatReport: {
    key: (report) => `chatReports.${report.chatID}`,
    selector: (chatID) => ({
      reportID: chatID,
      hash: 'someHash',
      amount: 100, // Placeholder amount
    }),
  },
  policy: {
    key: 'policy',
    selector: () => ({
      allowVBBA: true,
    }),
  },
})(withLocalize(PayActionCell));