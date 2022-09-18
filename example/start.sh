#!/bin/bash

rm -rf node_modules/@siposdani87
mkdir -p node_modules/@siposdani87/expo-maps-polygon-editor
cp -R ../dist node_modules/@siposdani87/expo-maps-polygon-editor
cp -R ../package.json node_modules/@siposdani87/expo-maps-polygon-editor
npm run tsc-test 
npm run start
