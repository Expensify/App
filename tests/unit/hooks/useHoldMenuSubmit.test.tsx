import { renderHook } from "@testing-library/react-native";

import useHoldMenuSubmit from "@hooks/useHoldMenuSubmit";

import { approveMoneyRequest } from "@userActions/IOU/ReportWorkflow";

import CONST from "@src/CONST";
import type { Report, Transaction } from "@src/types/onyx";

import { createRandomReport } from "../../utils/collections/reports";
import createRandomTransaction from "../../utils/collections/transaction";

const mockPayWithWiseQuote = jest.fn();
let mockReportTransactions: Transaction[] = [];

jest.mock("@userActions/IOU/ReportWorkflow", () => ({
  approveMoneyRequest: jest.fn(),
}));

jest.mock("@hooks/useReportTransactions", () => ({
  __esModule: true,
  default: () => mockReportTransactions,
}));

jest.mock("@hooks/usePayWithWiseQuote", () => ({
  __esModule: true,
  default: () => ({ payWithWiseQuote: mockPayWithWiseQuote }),
}));

jest.mock("@hooks/useOnyx", () => ({
  __esModule: true,
  default: () => [undefined],
}));

jest.mock("@hooks/usePolicy", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("@hooks/usePayChatReportActions", () => ({
  __esModule: true,
  default: () => () => undefined,
}));

jest.mock("@hooks/usePermissions", () => ({
  __esModule: true,
  default: () => ({ isBetaEnabled: () => false }),
}));

jest.mock("@hooks/useCurrentUserPersonalDetails", () => ({
  __esModule: true,
  default: () => ({
    accountID: 1,
    email: "approver@test.com",
    login: "approver@test.com",
  }),
}));

jest.mock("@hooks/useCurrencyList", () => ({
  useCurrencyListActions: () => ({ getCurrencyDecimals: () => 2 }),
}));

jest.mock("@hooks/useDelegateAccountID", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("@hooks/usePersonalDetailByLogin", () => ({
  useGetPersonalDetailsByLogin: () => () => ({}),
}));

jest.mock("@hooks/usePersonalDetails", () => ({
  usePersonalDetail: () => [undefined],
}));

jest.mock("@components/DelegateNoAccessModalProvider", () => ({
  useDelegateNoAccessState: () => ({ isDelegateAccessRestricted: false }),
  useDelegateNoAccessActions: () => ({ showDelegateNoAccessModal: jest.fn() }),
}));

jest.mock("@components/LockedAccountModalProvider", () => ({
  useLockedAccountState: () => ({ isAccountLocked: false }),
  useLockedAccountActions: () => ({ showLockedAccountModal: jest.fn() }),
}));

jest.mock("@libs/ReportUtils", () => ({
  getReportOrDraftReport: () => undefined,
  hasViolations: () => false,
}));

describe("useHoldMenuSubmit", () => {
  const moneyRequestReport: Report = {
    ...createRandomReport(1, undefined),
    reportID: "1",
  };
  const chatReport: Report = {
    ...createRandomReport(2, undefined),
    reportID: "2",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportTransactions = [
      { ...createRandomTransaction(1), reportID: moneyRequestReport.reportID },
    ];
  });

  it("passes the report transactions to approveMoneyRequest when approving", () => {
    // Given a hold menu for an approval of a report that has transactions
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useHoldMenuSubmit({
        moneyRequestReport,
        chatReport,
        requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
        onClose,
      }),
    );

    // When the approver picks an option
    result.current.onSubmit(true);

    // Then the transactions are handed to approveMoneyRequest instead of being looked up inside it, and the menu closes
    expect(approveMoneyRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseReportTransactions: mockReportTransactions,
        full: true,
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("passes the report transactions to payWithWiseQuote when paying", () => {
    // Given a hold menu for paying a report that has transactions
    const { result } = renderHook(() =>
      useHoldMenuSubmit({
        moneyRequestReport,
        chatReport,
        requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        onClose: jest.fn(),
      }),
    );

    // When the payer picks an option
    result.current.onSubmit(false);

    // Then the same transactions reach the payment flow and approval is not triggered
    expect(mockPayWithWiseQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        iouReportTransactions: mockReportTransactions,
        full: false,
      }),
    );
    expect(approveMoneyRequest).not.toHaveBeenCalled();
  });
});
