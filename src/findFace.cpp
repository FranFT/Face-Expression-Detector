#include <iostream>
//#include <opencv2/opencv.hpp>

using namespace std;
// using namespace cv;

int main(int argc, char **argv) {
  if (argc == 2) {
    cout << "Num. args: " << argc << endl;
    cout << "First arg: " << argv[1] << endl;
    return 0;
  } else {
    cerr << "This is an error." << endl;
    return 1;
  }
}
