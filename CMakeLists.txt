# Project definition and CMake Version.
cmake_minimum_required(VERSION 3.5 FATAL_ERROR)
project( "Face Expression Detector" VERSION 0.1 LANGUAGES CXX )

# Libraries
add_subdirectory( "lib/caffe" )
include("lib/dlib/dlib/cmake")

# Packages Required.
find_package( OpenCV REQUIRED )

# Executables
add_executable( findFace src/findFace.cpp )

# Link Libraries
target_link_libraries( findFace dlib::dlib ${OpenCV_LIBS} )
