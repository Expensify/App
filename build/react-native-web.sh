#!/usr/bin/env bash
cd ./node_modules/react-native-web &&
npm install &&
npm run compile &&
rm -rf ./node_modules &&
cd ./packages/react-native-web &&
npm install --only=prod &&
rm -rf ./node_modules/react ./node_modules/react-dom && 
cd ../../ &&
cp -R ./packages/react-native-web/* ./
