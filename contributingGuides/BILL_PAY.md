# Bill Pay

[Release 0.1](https://github.com/Expensify/Expensify/issues/684654) uses the existing Classic approval, reimbursement, and export flows.

`BillPayUtils` defines which reports belong in Bills and which users can approve or pay them. Spend, Home, and Inbox share these rules. Auth also scopes `type:bill` searches to the receiver.

Bills and received standalone invoices use report rows with Date, Status, Report title, From, To, Total, and Action. The Bills section appears only when the user has matching content.

`CreateBillPage` accepts manual details and an optional PDF. `BillPaymentButton` offers ACH and Mark as paid without needing a parent room. Both actions use optimistic Onyx updates with failure handling.

Auth's `isHiddenForBillReceiver` hides linked invoices from navigation and previews. It does not block opening an invoice URL or responding to a comment notification.

## Manual checks

1. Open a workspace with existing Classic bills and confirm that Spend shows Bills.
2. Search for a vendor and confirm that the receiver sees the bill without its linked invoice.
3. Approve a bill and confirm that the authorized payer sees it in Ready to pay, Home, and the Inbox.
4. Sign in as another workspace admin and confirm that the bill does not appear in their Ready to pay list.
5. Create a bill with a PDF and confirm that the typed details remain and neither report gains a parent room.
6. Pay an approved bill and confirm that its invoice updates to paid.
7. Open the linked invoice URL and confirm that comments remain available.
8. Open domain settings and confirm that the primary contact hint includes the domain's Bill Pay address.

Deploy Auth and Web-Expensify before App. No beta controls this feature.
