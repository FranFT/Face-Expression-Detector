# Project definition and CMake Version
cmake_minimum_required(VERSION 3.5 FATAL_ERROR)
project( "Face Expression Detector" VERSION 0.1 LANGUAGES CXX )

# Libraries
add_subdirectory( "lib/glfw" )

# Includes
include_directories( "lib/glfw/include" )

# Packages Required
find_package( OpenCV REQUIRED )
find_package( OpenGL REQUIRED )

# Executables
add_executable( main src/main.cpp)

# Link Libraries
target_link_libraries( main
   ${OpenCV_LIBS}
   ${OPENGL_LIBRARIES}
   glfw ${OPENGL_glu_LIBRARY} ${GLFW_LIBRARIES}
)
