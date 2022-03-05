#!/bin/bash

. $NVM_DIR/nvm.sh
nvm install 14
nvm use 14

npm i -g npm@latest

npm install
npm run build
