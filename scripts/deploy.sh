#!/bin/sh
for l in `cat .env` ; do export $l ; done

rm -rf $DEPLOY_PATH/admin/
mkdir -v $DEPLOY_PATH/admin/
cp -rf chargen.js $DEPLOY_PATH/admin/
cp -rf index.html $DEPLOY_PATH/admin/
cp -rf index.js $DEPLOY_PATH/admin/
cp -rf loadmap.html $DEPLOY_PATH/admin/
cp -rf Universal-LPC-Spritesheet-Character-Generator $DEPLOY_PATH/admin/
