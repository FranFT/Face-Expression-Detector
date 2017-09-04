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
void generateClassifierImage(const cv::Mat &_img, const cv::Rect &_roi) {
  cv::Mat output;
  cv::resize(_img(_roi), output, cv::Size(256, 256));
  cv::imwrite("temp/output.jpg", output);
}

// This method generates the image that will be shown in the app. We draw de
// face area into the final image.
void generateUImage(cv::Mat &_img, const cv::Rect &face_area) {
  cv::rectangle(_img, face_area, cv::Scalar(0, 0, 255), 2);
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

cv::Rect detectFace(const cv::Mat &_img) {
  // cv::auxImage = _img.clone();
  cv::Rect output;
  // Loading detector.
  dlib::frontal_face_detector detector = dlib::get_frontal_face_detector();
  // Transforming opencv image to dlib image.
  dlib::cv_image<dlib::bgr_pixel> dlibImage(_img);
  // Detecting face.
  std::vector<dlib::rectangle> dets = detector(dlibImage);
  // If faces were found.
  if (dets.size() > 0) {
    // Convert rectangle to OpenCV Rect object.
    output = dlibRectangleToOpencvRect(dets[0], _img.size());
  }
  return output;
}

// Main.
int main(int argc, char **argv) {
  if (argc != 2) {
    std::cerr << "Please, specify an image path." << std::endl;
    return 0;
  }

  // Variables.
  cv::Mat opencvImage;
  cv::Rect face;

  // Reading image.
  opencvImage = cv::imread(argv[1]);
  if (!opencvImage.data) {
    std::cerr << "Could not open the image " << argv[1] << std::endl;
    return 0;
  }

  // Detecting face using dlib.
  face = detectFace(opencvImage);

  // Checking output.
  if (!face.width || !face.height) {
    std::cerr << "Could not find a face in the image: '" << argv[1] << "'"
              << std::endl;
    return 0;
  }

  // Generating image to be classied.
  generateClassifierImage(opencvImage, face);
  // Generating user interface image.
  generateUImage(opencvImage, face);

  // Output for Electron main process.
  std::cout << face.x << "," << face.y << ";" << face.width << ","
            << face.height << std::endl;
  return 0;
}
