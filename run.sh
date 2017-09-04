#! /bin/bash

# Building Node JS modules and electron.
#npm install
#npm start
if [ ! -d "build/" ];then
  mkdir build
  cd build
  cmake .. && make -j2
  cd ..
fi
npm start
