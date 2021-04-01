#!/bin/bash

sudo npm i -g eslint expo-cli expo-optimize
rm -rf package-lock.json
npm install
npm outdated
eslint . --fix
npm run tsc-test 
expo start -c
