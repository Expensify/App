---
title: Learn About Company Card Connections
description: Learn the differences between direct connections and commercial card feeds for importing company card transactions into Expensify.
keywords: [company card connections Expensify, company card connection types, direct connection Expensify, commercial card feed Expensify, company card feed Expensify, direct connection vs commercial card feed, Visa VCF Expensify, Mastercard CDF Expensify, American Express GL1025 Expensify]
internalScope: Audience is Expensify members. Covers the differences between direct connections and commercial card feeds for importing company card transactions. Does not cover setting up a company card connection or assigning company cards to members.
---

# Learn About Company Card Connections

When a company card account is connected, the individual card accounts under the connected account import into Expensify, where they can be assigned to workspace members. Once assigned, transactions import into the assigned member's account as expenses so they can be added to reports.

Expensify supports two options for company card connections: direct connections and commercial card feeds. The connection determines how transactions are delivered to Expensify, but does not affect how they behave after they import. 

If your company cards can't be connected, you can import company card transactions from a spreadsheet instead. 

---

## How direct connections work

With a direct connection, a workspace admin or card admin logs in to the bank through Expensify to connect the company's online credit card account. Expensify receives posted transactions through that connection. To check if Expensify supports a direct connection with your bank, see Check Supported Banks.

Learn how to set up a direct company card connection. 

---

## How commercial card feeds work

With a commercial card feed, your bank delivers a daily file to Expensify containing card transactions. Since the bank is sending transactions to Expensify directly, you do not need to log into your bank. Expensify supports the following commercial card feed types: 

 - Visa (VCF)
 - Mastercard (CDF)
 - American Express (GL1025)

Learn how to set up a commercial card feed.

---

## How direct connections and commercial card feeds compare

|                                      | Direct connection                                                               | Commercial card feed                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| How the connection is established    | A workspace admin or card admin logs in to the bank through Expensify                         | The company arranges a file feed delivery with their bank                                  |
| How the connection can be used across workspaces   | The direct bank connection can be shared with other workspaces                                            | The commercial card feed can be shared with other workspaces                                             |
| How transactions behave after import | Transactions import into the assigned member's account as company card expenses | Transactions import into the assigned member's account as company card expenses |

---

# FAQ 

## Which company card connection should I use?

Use a commercial card feed when one is available. Commercial card feeds are maintained by the bank and do not require you to manually authenticate the connection. If a commercial card feed is not available, use a direct connection if Expensify supports a connection with your bank.

## Do direct connections and commercial card feeds import expenses differently?

No. With both connection types, the individual card accounts under the connected account import into Expensify. Those cards are then assigned to workspace members, and transactions from each card import into the assigned member's account as company card expenses. After transactions import, they behave the same regardless of the connection type.

## Can I import company card transactions without a direct connection or commercial card feed?

Yes. You can manually import company card transactions from a spreadsheet instead of using a direct connection or commercial card feed. Learn how to import company card transactions from a spreadsheet.

## Can I Use the Same Company Card Connection With Multiple Workspaces?

Yes. Once a company card connection is established, you can share it with other workspaces instead of setting up the connection again. Learn how to share a company card connection across workspaces.

## Related articles 

 - Understand How Card Connections Work
 - Share a Company Card Connection Across Workspaces
 - Assign company cards 
