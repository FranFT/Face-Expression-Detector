#include <iostream>
#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;

// Struct that stores image detected face and eye areas.
struct FacialFeatures {
  bool face_found, eyes_found;
  Rect face;
  Rect eye1;
  Rect eye2;
};

/*** Functions ***/
// Loading classifiers.
bool loadClassifers(CascadeClassifier &_face, CascadeClassifier &_eye) {
  bool output = true;
  const String face_dectector_name = "haarcascade_frontalface_alt2.xml";
  const String eye_detector_name = "haarcascade_eye_tree_eyeglasses.xml";
  // Getting the cascade classifiers.
  if (!_face.load("data/" + face_dectector_name)) {
    cerr << "Could not find: data/" << face_dectector_name << endl;
    output = false;
  }
  if (!_eye.load("data/" + eye_detector_name)) {
    cerr << "Could not find: data/" << eye_detector_name << endl;
    output = false;
  }
  return output;
}

// Passing from ROI relative coordinates to absolute img coordinates.
Rect roiToOriginalCoordinates(const Rect &_roi, const Rect &_rect) {
  return Rect(_roi.x + _rect.x, _roi.y + _rect.y, _rect.width, _rect.height);
}

// Searching for faces and eyes in the image.
FacialFeatures detectFeatures(const Mat &_img, CascadeClassifier &_face,
                              CascadeClassifier &_eye) {
  FacialFeatures output;
  vector<Rect> objs_found;
  Mat gray_img;

  cvtColor(_img, gray_img, CV_BGR2GRAY);
  equalizeHist(gray_img, gray_img);

  _face.detectMultiScale(gray_img, objs_found, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE,
                         Size(30, 30));
  if (!objs_found.empty()) {
    output.face = objs_found[0];
    output.face_found = true;
    objs_found.clear();

    Mat faceROI = gray_img(output.face);
    _eye.detectMultiScale(faceROI, objs_found, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE,
                          Size(30, 30));
    if (objs_found.size() == 2) {
      output.eye1 = roiToOriginalCoordinates(output.face, objs_found[0]);
      output.eye2 = roiToOriginalCoordinates(output.face, objs_found[1]);
      output.eyes_found = true;
    } else {
      output.eyes_found = false;
      cerr << objs_found.size() << " eyes found" << endl;
    }

  } else {
    output.face_found = output.eyes_found = false;
    cerr << "Faces could not be found." << endl;
  }

  return output;
}

// Main.
int main(int argc, char **argv) {
  if (argc != 2) {
    cerr << "Please, specify an image path." << endl;
    return 0;
  }

  // Varibles.
  Mat image;
  FacialFeatures features;
  CascadeClassifier face_detector, eye_detector;
  /*  Mat image, temp_image;
    vector<Rect> faces;
    CascadeClassifier face_detector;
    const String face_dectector_name = "haarcascade_frontalface_alt2.xml";*/

  // Reading the image
  image = imread(argv[1]);
  if (!image.data) {
    cerr << "Could not open the image." << endl;
    return 0;
  }
  if (!loadClassifers(face_detector, eye_detector))
    return 0;

  features = detectFeatures(image, face_detector, eye_detector);

  return 0;
}
