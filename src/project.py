# Import standard dependencies
import cv2

import os
import random
import numpy as np
from matplotlib import pyplot as plt
# Import tensorflow dependencies - Functional API
from keras.models import Model
from keras.layers import Layer, Conv2D, Dense, MaxPooling2D, Input, Flatten
import tensorflow as tf
# Avoid OOM errors by setting GPU Memory Consumption Growth
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus: 
    tf.config.experimental.set_memory_growth(gpu, True)
    
def preprocess(file_path):
    # Read in image from file path
    byte_img = tf.io.read_file(file_path)
    # Load in the image 
    img = tf.io.decode_jpeg(byte_img)
    
    # Preprocessing steps - resizing the image to be 100x100x3
    img = tf.image.resize(img, (100,100))
    # Scale image to be between 0 and 1 
    img = img / 255.0

    # Return image
    return img

def verify(model, detection_threshold, verification_threshold):
    # Build results array
    results = []
    for image in os.listdir(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'verification_images')):
        input_img = preprocess(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'anchor', 'input_image.jpg'))
        validation_img = preprocess(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'verification_images', image))
        
        # Make Predictions 
        result = model.predict(list(np.expand_dims([input_img, validation_img], axis=1)))
        results.append(result)
    
    # Detection Threshold: Metric above which a prediction is considered positive 
    detection = np.sum(np.array(results) > detection_threshold)
    
    # Verification Threshold: Proportion of positive predictions / total positive samples 
    verification = detection / len(os.listdir(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'verification_images'))) 
    verified = verification > verification_threshold
    
    # Find the index of the matching image
    matching_index = np.argmax(np.array(results))
    
    return results, verified, matching_index

# Siamese L1 Distance class
class L1Dist(Layer):
    
    # Init method - inheritance
    def __init__(self, **kwargs):
        super().__init__()
       
    # Magic happens here - similarity calculation
    def call(self, input_embedding, validation_embedding):
        return tf.math.abs(input_embedding - validation_embedding)

# Reload model 
siamese_model = tf.keras.models.load_model("C:/Users/91930/Downloads/siamesemodelv2.h5", 
                                   custom_objects={'L1Dist':L1Dist, 'BinaryCrossentropy':tf.losses.BinaryCrossentropy})
siamese_model.compile(optimizer='adam',  # Replace with your optimizer
                      loss='binary_crossentropy',  # Replace with your loss
                      metrics=['accuracy'])  # Replace with your metrics


cap = cv2.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    frame = frame[120:120+250,200:200+250, :]
    
    cv2.imshow('Verification', frame)
    
    # Verification trigger
    if cv2.waitKey(10) & 0xFF == ord('v'):
        # Save input image to application_data/input_image folder 
        cv2.imwrite(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'anchor', 'input_image.jpg'), frame)
        # Run verification
        results, verified, matching_index = verify(siamese_model, 0.8, 0.8)
        
        if verified:
            print("Image Verified!")
            
            # Display the matching image using Matplotlib
            matching_image_path = os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'verification_images', os.listdir(os.path.join('C:/Users/91930/OneDrive/Desktop/Mess/images', 'verification_images'))[matching_index])
            matching_image = cv2.imread(matching_image_path)
            print(matching_image_path)
    
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()