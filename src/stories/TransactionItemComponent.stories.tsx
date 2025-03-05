import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import TransactionItemComponent from '@components/TransactionItemComponent';
import type Transaction from '@src/types/onyx/Transaction';

type TransactionItemComponentStory = StoryFn<typeof TransactionItemComponent>;

// const transactionItemList : Array<TransactionListItemType & {bank:string,billable:boolean,cardID:number,cardName:string,cardNumber:string,filename:string}> = [
const transactionItemList : Array<Transaction&{mcc:string,modifiedMCC:string}> = [
    {
        "amount": -769900,
        "bank": "",
        "billable": false,
        "cardID": 0,
        "cardName": "Cash Expense",
        "cardNumber": "",
        "category": "CARS",
        "comment": {
            "comment": ""
        },
        "created": "2025-02-18",
        "currency": "PLN",
        "filename": "",
        "hasEReceipt": false,
        "inserted": "2025-02-18 14:23:29",
        "managedCard": false,
        "mcc": "",
        "merchant": "Mario's",
        "modifiedAmount": 0,
        "modifiedCreated": "",
        "modifiedCurrency": "",
        "modifiedMCC": "",
        "modifiedMerchant": "",
        "originalAmount": 0,
        "originalCurrency": "",
        "parentTransactionID": "",
        "posted": "",
        "receipt": {},
        "reimbursable": false,
        "reportID": "0",
        "status": "Posted",
        "tag": "privat",
        "transactionID": "1564303948126109676"
    }]


/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TransactionItemComponent> = {
    title: 'Components/TransactionItemComponent',
    component: TransactionItemComponent,
    args: {
        transactionItem: transactionItemList.at(0),
        isLargeScreenWidth:false
    },
    argTypes: {
        transactionItem: {
            control: 'object',
        },
        isLargeScreenWidth:{
            control:'boolean'
        },
    },
};

// Użycie args w story
function Template({ transactionItem,isLargeScreenWidth,}: { transactionItem: Transaction;isLargeScreenWidth:boolean;}) {
    return <TransactionItemComponent transactionItem={transactionItem} isLargeScreenWidth={isLargeScreenWidth}/>;
}

// Default Story
const Default: TransactionItemComponentStory = Template.bind({});
Default.args = {
    transactionItem: transactionItemList.at(0),
    isLargeScreenWidth:false
};



export default story;
export {Default};
