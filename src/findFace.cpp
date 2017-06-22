#include <iostream>
#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;

int main(int argc, char **argv) {
  if (argc != 2) {
    cerr << "Please, specify an image path." << endl;
    return 0;
  }

  // Varibles.
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

  // findFace output.
  if (faces.empty()) {
    cerr << "Could not find a face in the image: '" << argv[1] << "'" << endl;
    return 0;
  } else {
    // Output image used for classification.
    resize(image(faces.at(0)), image, Size(256, 256));
    imwrite("temp/output.jpg", image);

    cout << faces[0].x << "," << faces[0].y << ";" << faces[0].width << ","
         << faces[0].height << endl;
  }

  return 0;
}
