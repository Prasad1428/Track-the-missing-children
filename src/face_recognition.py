import ArcFace
from mtcnn.mtcnn import MTCNN
import matplotlib.pyplot as plt
import cv2
from tensorflow.keras.preprocessing import image
import numpy as np
model = ArcFace.loadModel()
face_detector = MTCNN()
def detect_face(img):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) #mtcnn expects RGB but OpenCV read BGR
    detections = face_detector.detect_faces(img_rgb)
    detection = detections[0]
    x, y, w, h = detection["box"]
    detected_face = img[int(y):int(y+h), int(x):int(x+w)]
    return detected_face
def preprocess_face(img, target_size=(112,112)):
    img = cv2.imread(img)
    img = detect_face(img)
    img = cv2.resize(img, target_size)
    img_pixels = image.img_to_array(img)
    img_pixels = np.expand_dims(img_pixels, axis = 0)
    img_pixels /= 255 #normalize input in [0, 1]
    return img_pixels
def img_to_encoding(path):
    img = preprocess_face(path)
    return model.predict(img)[0]

database = {}

database["Prasad"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/Prasad.jpg")
database["Manpreat"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/Manpreat.jpg")
database["Bill"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/bill.jpg")
database["Kalpana"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/kalpana.jpg")
database["Tejas"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/Tejas.jpeg")
database["Anand"] = img_to_encoding("C:/Users/91930/Downloads/deep-face-recognition/images/Anand.jpg")
def EuclideanDistance(source_representation, test_representation):
    euclidean_distance = source_representation - test_representation
    euclidean_distance = np.sum(np.multiply(euclidean_distance, euclidean_distance))
    euclidean_distance = np.sqrt(euclidean_distance)
    return euclidean_distance


def who_is_it(image_path, database):
   
    ## Step 1: Compute the target "encoding" for the image. Use img_to_encoding()
    encoding = img_to_encoding(image_path)
    
    ## Step 2: Find the closest encoding ##
    
    # Initialize "min_dist" to a large value, say 100 
    min_dist = 1000
    # Loop over the database dictionary's names and encodings.
    for (name, db_enc) in database.items():
        # Compute L2 distance between the target "encoding" and the current "emb" from the database. (≈ 1 line)
        dist = EuclideanDistance(encoding, db_enc)

        # If this distance is less than the min_dist, then set min_dist to dist, and identity to name. (≈ 3 lines)
        if min_dist > dist:
            min_dist = dist
            identity = name

    verification_threshold=4.4
    if min_dist > verification_threshold:
        print("Not in the database.")
    else:
        print ("it's " + str(identity) + ", the distance is " + str(min_dist))
        
    return min_dist, identity
who_is_it("C:/Users/91930/Downloads/manpreat_jr.jpeg", database)