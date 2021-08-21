#!/bin/bash

sudo npm i -g eslint expo-cli expo-optimize
rm -rf package-lock.json
yarn remove @siposdani87/expo-maps-polygon-editor
yarn add file:../
yarn install
yarn outdated
eslint . --fix
npm run tsc-test 
expo start -c
