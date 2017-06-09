#! /bin/bash
yarn build

mkdir package
cp -r dist electron package.json package

electron-packager package aslack-stream --platform=darwin --icon=icons/ss.icns --arch=all --overwrite
electron-packager package aslack-stream --platform=win32 --icon=icons/ss.ico --arch=all --overwrite
electron-packager package aslack-stream --platform=linux --arch=all --overwrite

for f in aslack-stream*
do
    echo "Creating zip: $f.zip"
    zip $f.zip -r $f > /dev/null
done

rm -rf package
