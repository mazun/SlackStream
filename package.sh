#! /bin/bash
yarn build

mkdir package
cp -r dist electron package.json package

electron-packager package aslack-stream --platform=all --arch=all --overwrite
for f in aslack-stream*
do
    zip $f.zip -r $f
done

rm -rf package
