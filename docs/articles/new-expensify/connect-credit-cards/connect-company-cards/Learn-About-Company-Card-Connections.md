---
title: Learn About Company Card Connections
description: Learn the difference between direct feeds and commercial feeds for importing company card transactions from your bank or card provider into Expensify.
keywords: [company card connections Expensify, company card connection types, direct connection Expensify, commercial card feed Expensify, company card feed Expensify, direct connection vs commercial card feed, Visa VCF Expensify, Mastercard CDF Expensify, American Express GL1025 Expensify]
internalScope: Audience is Expensify members. Covers the differences between direct connections and commercial card feeds for importing company card transactions. Does not cover setting up a company card connection or assigning company cards to members.
order: 1
---

# Learn About Company Card Connections

When a company card account is connected to Expensify, the individual cards under that account become available to assign to workspace members. Once a card is assigned, its transactions import into the assigned member's account as expenses that can be added to reports.

Expensify supports two types of company card connections: direct connections and commercial card feeds. The connection type determines how the company card account is connected to Expensify, but it does not affect how transactions appear after they import.

---

## How direct connections work

With a direct connection, a workspace admin or card admin connects the company's credit card account to Expensify by signing in to the bank or card provider and authenticating the connection.

To check whether Expensify supports a direct feed with your bank, see [Check Supported Banks](/articles/new-expensify/connect-credit-cards/Check-Supported-Banks).

[Learn how to set up a direct company card connection](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Direct-Company-Card-Feed-Connection).

---

## How commercial card feeds work

With a commercial card feed, your bank delivers a daily file to Expensify containing card transactions. Unlike a direct connection, you do not need to sign in to your bank or card provider through Expensify.

Expensify supports the following commercial card feed types:

 - Visa (VCF)
 - Mastercard (CDF)
 - American Express (GL1025)

[Learn how to set up a commercial card feed](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Commercial-Card-Feed-Connection).

---

## How direct connections and commercial card feeds compare

|                                      | Direct connection                                                               | Commercial card feed                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| How the connection is established    | A workspace admin or card admin signs in to the bank or card provider through Expensify to authenticate the connection.                         | Your organization arranges for its bank to deliver a file feed to Expensify                                  |
| How the connection can be used across workspaces   | The connection can be shared with other workspaces.                                            | The feed can be shared with other workspaces.                                             |
| How transactions behave after import | Transactions import into the assigned member's account as company card expenses. | Transactions import into the assigned member's account as company card expenses. |

---

# FAQ 

## Which company card connection should I use?

Use a commercial card feed when one is available. Commercial card feeds are maintained by the bank and do not require you to authenticate the connection by signing in to your bank or card provider through Expensify.

If a commercial card feed is not available, use a direct connection if Expensify supports one with your bank or card provider.

## Do direct connections and commercial card feeds import expenses differently?

No. With both connection types, the individual cards under the connected account become available in Expensify to assign to workspace members. Transactions from each assigned card then import into the assigned member's account as company card expenses.

After transactions import, they behave the same regardless of the connection type.

## Can I import company card transactions without a direct connection or commercial card feed?

Yes. You can manually import company card transactions from a spreadsheet instead of using a direct connection or commercial card feed. [Learn how to import company card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/connect-company-cards/Import-Company-Card-Transactions-From-a-Spreadsheet) instead. 


## Can I use the same company card connection with multiple workspaces?

Yes. Once a company card connection is established, you can share it with other workspaces instead of setting up the connection again. [Learn how to share a company card connection across workspaces](s/articles/new-expensify/connect-credit-cards/connect-company-cards/Share-a-Company-Card-Connection-Across-Workspaces).

## Related articles 

 - [Understand How Credit Card Connections Work](/articles/new-expensify/connect-credit-cards/Understand-How-Credit Card-Connections-Work)
 - [Assign Company Cards](/articles/new-expensify/connect-credit-cards/configure-and-manage-company-cards/Assign-Company-Cards)
 - [Configure Company Cards](/articles/new-expensify/connect-credit-cards/configure-and-manage-company-cards/Configure-Company-Card-Settings)
