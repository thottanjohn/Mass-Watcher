from statistics import mode

import cv2
from keras.models import load_model
import numpy as np
import os
import matplotlib. pyplot as plt
from req.datasets import get_labels
from req.inference import detect_faces
from req.inference import draw_text
from req.inference import draw_bounding_box
from req.inference import apply_offsets
from req.inference import load_detection_model
from req.preprocessor import preprocess_input
from tensorflow.keras.models import model_from_json
from PIL import Image
#---------------------------- ROHAN'S CODE ---------------------------------

import tensorflow.compat.v1 as tf
import sys
import glob

path = os.getcwd()+'/' + 'FINAL/src/'
url='http://192.168.43.1:8080/shot.jpg?rnd=716381'
# path = os.path.join(path, 'FINAL','src')
face_cascade = cv2.CascadeClassifier(path+'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(path+'haarcascade_eye.xml')
face = []
IM_SIZE = 32
BATCH_SIZE = 100
WINDOW_SIZE = 2

#tf.debugging.set_log_device_placement(True)

sess = tf.InteractiveSession()




prev_face = [(0,0,30,30)]
prev_eyes = [(1,1,1,1), (1,1,1,1)]
drowsiness_check_list = [0] * WINDOW_SIZE
drowsiness_check_idx = 0



# load weights into new model
attention_model=load_model( path + '/../trained_models/modelattention.h5')
#attention_path= ('sampleattentionmodel.h5')
#attention_model=load_model(attention_path)
def atten(eyes,roi_color):
    roi_color=Image.fromarray(roi_color, 'RGB')
    #print(roi_color.shape)
    i = roi_color.resize((128 ,128))
    i = np.asarray(i)
    i = np.reshape(i, (1, i.shape[0], i.shape[1], i.shape[2]))
    result=attention_model.predict(i)
    attentive=np.squeeze(result.argmax(axis=-1))
    if attentive==0:
        attention=True
        attention_text="Attentive"
        #draw_text(face_coordinates, rgb_image, attention_text,color,1, -65, 1, 1)
    else:
        attention=False
        attention_text="Not Attentive"
        #draw_text(face_coordinates, rgb_image,attention_text,color, 1, -65, 1, 1)
    bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
    cv2.imwrite('bgr_img.jpg', bgr_image)
    #cv2.imshow('window_frame', bgr_image)
    return attention


#--------------------------------- END ------------------------------------



# gender_model_path = path+'FINAL/trained_models/gender_model_vgg.hdf5'
gender_model_path = path + '/../trained_models/gender_model_vgg.hdf5'
gender_labels = get_labels('imdb')

detection_model_path = path + '/../trained_models/detection_models/haarcascade_frontalface_default.xml'
emotion_model_path = path + '/../trained_models/16_layer_relu_test.hdf5'
emotion_labels = get_labels('fer2013')



# hyper-parameters for bounding boxes shape
frame_window = 10
gender_offsets = (30, 60)
emotion_offsets = (20, 40)


# loading models



face_detection = load_detection_model(detection_model_path)
emotion_classifier = load_model(emotion_model_path, compile=False)

gender_classifier = load_model(gender_model_path, compile=False)



# getting input model shapes for inference
emotion_target_size = emotion_classifier.input_shape[1:3]
gender_target_size = gender_classifier.input_shape[1:3]
# starting lists for calculating modes
emotion_window = []
gender_window = []


# starting video streaming
#cv2.namedWindow('window_frame')
#video_capture = cv2.VideoCapture(1)
video_capture = cv2.VideoCapture(0) #if no other device selected ,In my case droid cam is device 0.
"""while(True):
    # Capture frame-by-frame
    ret, frame = video_capture.read()
    frame = frame.astype('uint8')
    # Our operations on the frame come here
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Display the resulting frame
    #cv2.imshow('frame',gray)
    plt.imshow(frame, cmap = 'gray', interpolation = 'bicubic')
    plt.xticks([]), plt.yticks([])  # to hide tick values on X and Y axis
    plt.show()
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
"""


while True:
    
    #testp = path +'3.txt'
    
    """if(os.path.exists(testp)):
        bgr_image = cv2.imread(path+'1.jpg')
    else:
        bgr_image = cv2.imread(path+'2.jpg')"""
    ret, frame = video_capture.read()
    #frame= cv2.imread(os.getcwd()+'/IMG-20200312-WA0282.jpg')
    bgr_image= frame.astype('uint8')
    gray_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    faces = detect_faces(face_detection, gray_image)
    face = []
    face2 = []
    face_count = 0
    for face_coordinates in faces:
        x1, x2, y1, y2 = apply_offsets(face_coordinates, gender_offsets)
        rgb_face = rgb_image[y1:y2, x1:x2]
        bgr_face = bgr_image[y1:y2, x1:x2]
        x1, x2, y1, y2 = apply_offsets(face_coordinates, emotion_offsets)
        gray_face = gray_image[y1:y2, x1:x2]
        try:
            rgb_face = cv2.resize(rgb_face, (gender_target_size))
            gray_face = cv2.resize(gray_face, (emotion_target_size))
        except:
            continue
        gray_face = preprocess_input(gray_face, True)
        gray_face = np.expand_dims(gray_face, 0)
        gray_face = np.expand_dims(gray_face, -1)
        emotion_prediction = emotion_classifier.predict(gray_face)
        emotion_probability = np.max(emotion_prediction)
        emotion_label_arg = np.argmax(emotion_prediction)
        emotion_text = emotion_labels[emotion_label_arg]
        rgb_face = np.expand_dims(rgb_face, 0)
        rgb_face = preprocess_input(rgb_face, False)
        gender_prediction = gender_classifier.predict(rgb_face)
        gender_label_arg = np.argmax(gender_prediction)
        gender_text = gender_labels[gender_label_arg]
        gender_window.append(gender_text)
        emotion_window.append(emotion_text)
        if len(emotion_window) > frame_window:
            emotion_window.pop(0)
            gender_window.pop(0)
        try:
            emotion_mode = mode(emotion_window)
            gender_mode = mode(gender_window)
        except:
            continue
        if gender_text == gender_labels[0]:
            color = (0, 0, 255)
        else:
            color = (255, 0, 0)
        if emotion_text == 'angry':
            color = emotion_probability * np.asarray((255, 0, 0))
        elif emotion_text == 'sad':
            color = emotion_probability * np.asarray((0, 0, 255))
        elif emotion_text == 'happy':
            color = emotion_probability * np.asarray((255, 255, 0))
        elif emotion_text == 'surprise':
            color = emotion_probability * np.asarray((0, 255, 255))
        else:
            color = emotion_probability * np.asarray((0, 255, 0))
        color = color.astype(int)
        color = color.tolist()
        draw_bounding_box(face_coordinates, rgb_image, color)
        draw_text(face_coordinates, rgb_image, emotion_text,color, 0, -45, 1, 1)
        #draw_text(face_coordinates, rgb_image, gender_text,color, 0, -20, 1, 1)
        roi_gray = gray_image[y1:y2, x1:x2]
        roi_color = bgr_image[y1:y2, x1:x2]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        face_count += 1
        text = "Person" + str(face_count)
        #cv2.putText(img, text, (int(x + w/2), int(y)), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        cordi = ""
        l = 0
        for cor in face_coordinates:
            if l == 0:
                cordi += str(cor.item())
                l += 1
            else:
                cordi += ','+str(cor.item())
        face.append({"face": cordi, "emotion": emotion_text, "gender": gender_text, "attentive": atten(eyes, roi_color)})
        #face2.append({"face": cordi, "attentive": atten(eyes, roi_color)})
        statusdata =[]
        if tf.test.is_gpu_available(cuda_only=False, min_cuda_compute_capability=None):
            status=True
        else:
            status=False
        statusdata.append({"status":status})

        import json
        import codecs
        with open(path + '4forces.json', 'wb') as f:
            json.dump(face, codecs.getwriter('utf-8')(f), ensure_ascii=False)
        with open(path + 'statusdata.json', 'wb') as f:
            json.dump(statusdata, codecs.getwriter('utf-8')(f), ensure_ascii=False)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        video_capture.release()
        break