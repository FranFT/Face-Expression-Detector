#include <iostream>
#include <GL/glew.h>
#define GLFW_DLL // Windows compatibility
#include <GLFW/glfw3.h>

void drop_callback(GLFWwindow* window, int count, const char** paths)
{
    int i;
    for (i = 0;  i < count;  i++){
        //handle_dropped_file(paths[i]);
        std::cout << paths[i];
    }
    std::cout << std::endl;
}

int main( int argc, char** argv )
{
  GLFWwindow* window;

  /* Initialize the library */
  if (!glfwInit())
    return 1;

  /* Window options */
  glfwWindowHint( GLFW_CONTEXT_VERSION_MAJOR, 3 ); // OpenGL 3.3.
  glfwWindowHint( GLFW_CONTEXT_VERSION_MINOR, 3 );
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

  /* Create a windowed mode window and its OpenGL context */
  window = glfwCreateWindow(800, 600, "Face Expression Detector",NULL, NULL);
  if (!window){
    glfwTerminate();
    return 1;
  }

  /* Make the window's context current */
  glfwMakeContextCurrent(window);

  /* Set callback functions */
  glfwSetDropCallback(window, drop_callback);

  /* Loop until the user closes the window */
  while (!glfwWindowShouldClose(window))
  {
    /* Render here */
    glClear(GL_COLOR_BUFFER_BIT);

    /* Swap front and back buffers */
    glfwSwapBuffers(window);

    /* Poll for and process events */
    //glfwPollEvents();
    glfwWaitEvents();
  }

  glfwTerminate();

  return 0;
}
