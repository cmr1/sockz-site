#!/bin/bash

. $NVM_DIR/nvm.sh
nvm install 14
nvm use 14

npm install
npm run build
