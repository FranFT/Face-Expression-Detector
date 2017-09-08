#include <dlib/image_io.h>
#include <dlib/image_processing.h>
#include <dlib/image_processing/frontal_face_detector.h>
#include <dlib/image_transforms.h>
#include <dlib/opencv.h>
#include <iostream>
#include <opencv2/opencv.hpp>

/*** Functions ***/
// This method generate the output image that will be passed to the CNN. It
// generates a 256x256 crop of the face area of the image.
void generateClassifierImage(const cv::Mat &_img, const cv::Rect &_roi,
                             const unsigned int _index) {
  cv::Mat output;
  std::string name = "temp/output-" + std::to_string(_index) + ".jpg";
  cv::resize(_img(_roi), output, cv::Size(256, 256));
  cv::imwrite(name, output);
}

// This method generates the image that will be shown in the app. We draw de
// face area into the final image.
void generateUImage(cv::Mat &_img, const std::vector<cv::Rect> &faces) {
  for (unsigned int i = 0; i < faces.size(); i++)
    cv::rectangle(_img, faces[i], cv::Scalar(0, 0, 255), 2);
  cv::imwrite("temp/thumbnail.jpg", _img);
}

// Transform a dlib-rectangle object to OpenCV-like rectangle object.
// http://dlib.net/dlib/geometry/rectangle.h.html
cv::Rect dlibRectangleToOpencvRect(dlib::rectangle &_rect,
                                   const cv::Size _size) {
  cv::Rect output;
  // Making sure rect fits in image limits.
  (_rect.left() < 0) ? output.x = 0 : output.x = _rect.left();
  (_rect.top() < 0) ? output.y = 0 : output.y = _rect.top();
  (_rect.width() + output.x > _size.width - 1)
      ? output.width = _size.width - output.x - 1
      : output.width = _rect.width() - 1;
  (_rect.height() + output.y > _size.height - 1)
      ? output.height = _size.height - output.y - 1
      : output.height = _rect.height();
  return output;
  // return cv::Rect(_rect.left(), _rect.top(), _rect.width(), _rect.height());
}

std::vector<cv::Rect> detectFace(const cv::Mat &_img) {
  // cv::auxImage = _img.clone();
  std::vector<cv::Rect> output;
  // Loading detector.
  dlib::frontal_face_detector detector = dlib::get_frontal_face_detector();
  // Transforming opencv image to dlib image.
  dlib::cv_image<dlib::bgr_pixel> dlibImage(_img);
  // Detecting face.
  std::vector<dlib::rectangle> dets = detector(dlibImage);
  // If faces were found.
  if (dets.size() > 0) {
    // Convert every detected rectangle to OpenCV Rect object.
    for (unsigned int i = 0; i < dets.size(); i++)
      output.push_back(dlibRectangleToOpencvRect(dets[i], _img.size()));
  }
  return output;
}

void generateOutput(cv::Mat &_img, const std::vector<cv::Rect> &_faces) {
  std::string output;
  for (unsigned int i = 0; i < _faces.size(); i++) {
    // Generating image to be classied.
    generateClassifierImage(_img, _faces[i], i);
    // Output for Electron main process.
    output += std::to_string(_faces[i].x) + "," + std::to_string(_faces[i].y) +
              ";" + std::to_string(_faces[i].width) + "," +
              std::to_string(_faces[i].height);
    if (i < _faces.size() - 1)
      output += "\n";
    // std::cout << faces.x << "," << faces.y << ";" << faces.width << ","
    //<< faces.height << std::endl;
  }
  std::cout << output;
  // Generating user interface image.
  generateUImage(_img, _faces);
}

// Main.
int main(int argc, char **argv) {
  if (argc != 2) {
    std::cerr << "Please, specify an image path." << std::endl;
    return 0;
  }

  // Variables.
  cv::Mat opencvImage;
  std::vector<cv::Rect> faces;

  // Reading image.
  opencvImage = cv::imread(argv[1]);
  if (!opencvImage.data) {
    std::cerr << "Could not open the image " << argv[1] << std::endl;
    return 0;
  }

  // Detecting face using dlib.
  faces = detectFace(opencvImage);

  // Checking output.
  if (!faces.size()) {
    std::cerr << "Could not find a face in the image: '" << argv[1] << "'"
              << std::endl;
    return 0;
  }

  generateOutput(opencvImage, faces);

  return 0;
}
