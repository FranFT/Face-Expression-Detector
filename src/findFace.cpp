#include <iostream>
#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;

int main(int argc, char **argv) {
  if (argc != 2) {
    cerr << "Image Path needed." << endl;
    return 0;
  }

  // Varibles.
  /*vector<Rect> faces;
  Mat temp_image, gray_image;
  CascadeClassifier face_cascade;
  String face_cascade_name = "haarcascade_frontalface_alt2.xml";*/
  Mat image;
  vector<Rect> faces;
  CascadeClassifier face_detector;
  const String face_dectector_name = "haarcascade_frontalface_alt2.xml";

  // Reading the image.
  image = imread(argv[1], CV_LOAD_IMAGE_GRAYSCALE);
  if (!image.data) {
    cerr << "Could not open the image." << endl;
    return 0;
  }

  // Getting the cascade classifier.
  if (!face_detector.load("data/" + face_dectector_name)) {
    cerr << "Could not find: data/" << face_dectector_name << endl;
    return 0;
  }

  // Preprocessing.
  equalizeHist(image, image);

  // Detect faces
  face_detector.detectMultiScale(image, faces, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE,
                                 Size(image.cols / 4, image.rows / 4));

  if (faces.empty()) {
    cerr << "Could not find a face in the image: '" << argv[1] << "'" << endl;
    return 0;
  } else {
    cout << faces.at(0) << endl;
  }

  return 0;
}
