#!/bin/bash

yarn
tsc
sass src:dist
cd src-vite
yarn
yarn build
