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
    }
  } else {
    output.face_found = output.eyes_found = false;
  }

  return output;
}

// Calculates the angle between the horizontal axis and the eyes.
double calculateEyeAngle(const FacialFeatures &_features) {
  double length1 = sqrt(pow(_features.eye2.x - _features.eye1.x, 2) +
                        pow(_features.eye2.y - _features.eye1.y, 2));
  double length2 = sqrt(pow(_features.eye2.x - _features.eye1.x, 2));

  double angle = (acos(length2 / length1) * 180.0) / CV_PI;

  return angle;
}

// Aling eyes with the horizontal axis.
Mat alignEyes(const Mat &_img, const FacialFeatures &_features) {
  // Variables.
  Mat rotated_image;

  // Getting alineation angle between eyes.
  double angle = calculateEyeAngle(_features);

  // Aligning eyes only if necesary.
  if (abs(angle) > 4.0) {
    Mat rot_matrix = getRotationMatrix2D(
        Point((_features.face.x + _features.face.width) / 2,
              (_features.face.y + _features.face.height) / 2),
        angle, 1.0);
    warpAffine(_img, rotated_image, rot_matrix, _img.size(), CV_INTER_CUBIC,
               BORDER_REFLECT);
    return rotated_image;
  } else {
    return _img;
  }
}

void generateClassifierImage(const Mat &_image, const Rect &_roi) {
  Mat output;
  resize(_image(_roi), output, Size(256, 256));
  imwrite("temp/output.jpg", output);
}
void generateUImage(Mat &_image, const FacialFeatures &_features) {
  rectangle(_image, _features.face, Scalar(0, 0, 255), 2);
  imwrite("temp/thumbnail.jpg", _image);
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

  // Reading the image
  image = imread(argv[1]);
  if (!image.data) {
    cerr << "Could not open the image." << endl;
    return 0;
  }
  // Loading classifiers.
  if (!loadClassifers(face_detector, eye_detector))
    return 0;

  // Detecting face and eyes.
  features = detectFeatures(image, face_detector, eye_detector);

  // If both were found, align eyes.
  if (features.face_found && features.eyes_found) {
    Mat rotated_image = alignEyes(image, features);
    generateClassifierImage(rotated_image, features.face);
  } else if (features.face_found) {
    generateClassifierImage(image, features.face);
  } else {
    cerr << "Could not find a face in the image: '" << argv[1] << "'" << endl;
    return 0;
  }

  generateUImage(image, features);

  return 0;
}
