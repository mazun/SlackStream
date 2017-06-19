#! /bin/bash
yarn build

mkdir package
cp -r dist electron package.json package
mkdir package/icons
cp icons/ss.png package/icons/ss.png

electron-packager package slack-stream --platform=darwin --icon=icons/ss.icns --arch=all --overwrite
electron-packager package slack-stream --platform=win32 --icon=icons/ss.ico --arch=all --overwrite
electron-packager package slack-stream --platform=linux --arch=all --overwrite

for f in slack-stream*
do
    echo "Creating zip: $f.zip"
    zip $f.zip -r $f > /dev/null
done

rm -rf package
