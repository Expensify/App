const collectionData1 = {1: {value: 1}, 2: {value: 2}};
Onyx.set('testCollection_1', collectionData1);
delete collectionData1[1];
Onyx.set('testCollection_1', collectionData1);
