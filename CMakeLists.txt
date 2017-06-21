# Project definition and CMake Version.
cmake_minimum_required(VERSION 3.5 FATAL_ERROR)
project( "Face Expression Detector" VERSION 0.1 LANGUAGES CXX )

# Libraries
add_subdirectory( "lib/caffe" )

# Includes
include_directories( "lib/caffe/include" )

# Packages Required.
find_package( OpenCV REQUIRED )

# Executables
add_executable( findFace src/findFace.cpp )
#add_executable( classifier src/classification.cpp )

# Link Libraries
target_link_libraries( findFace ${OpenCV_LIBS} )
#target_link_libraries( classifier ${OpenCV_LIBS} ${Caffe_LIBRARIES} )
