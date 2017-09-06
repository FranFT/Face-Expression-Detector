# Application running stript tested on Ubuntu 16.04 LTS
# To install all dependencies, run the script with the "--install" argument.
# Note: This script does not install CUDA dependencies so Caffe will run in
# CPU-ONLY mode.

#! /bin/bash

if [ "$1" == "--install" ];
then
  echo "Installing dependencies..."
  #Electron dependencies
  sudo apt-get install npm nodejs-legacy cmake

  #Caffe dependencies (http://caffe.berkeleyvision.org/install_apt.html).
  sudo apt-get install  libprotobuf-dev libleveldb-dev libsnappy-dev libopencv-dev libboost-all-dev libhdf5-serial-dev protobuf-compiler libatlas-base-dev libgflags-dev libgoogle-glog-dev liblmdb-dev
fi

# Installing Electron if not installed
if [ ! -d "node_modules/" ];then
  echo "Installing Electron framework..."
  npm install electron --save-dev
fi

# Building Caffe and C++ modules.
if [ ! -d "build/" ];then
  echo "Building Caffe and C++ modules..."
  mkdir build
  cd build
  cmake .. && make -j2
  cd ..
else
  cd build
  make -j2
  cd ..
fi

# Starting App.
npm start
