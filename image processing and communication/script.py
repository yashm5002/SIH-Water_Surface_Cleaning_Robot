import cv2
import numpy as np
import serial
import time
import requests
from gpiozero import CPUTemperature
import threading

# Serial communication with Arduino
ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)

# OpenCV setup for garbage detection
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, 30)

classes = []
with open("model/obj.names") as file_object:
    for class_name in file_object.readlines():
        class_name = class_name.strip()
        classes.append(class_name)

net = cv2.dnn.readNet("model/custom-yolov4-tiny-detector_last.weights","model/custom-yolov4-tiny-detector.cfg")
model = cv2.dnn_DetectionModel(net)
model.setInputParams(size=(416, 416), scale=1/255)

def detect_garbage():
    detected_objects = []
    while True:
        success, frame = cap.read()
        classIds, scores, boxes = model.detect(frame, confThreshold=0.6, nmsThreshold=0.3)
        
        if len(classIds) != 0:
            for i in range(len(classIds)):
                classId = int(classIds[i])
                box = boxes[i]
                x, y, w, h = box
                detected_objects.append(box)

                # Send image feed to cloud
                _, img_encoded = cv2.imencode('.jpg', frame)
                requests.post('http://yourserver.com/upload', data=img_encoded.tobytes(), headers={'Content-Type': 'image/jpeg'})
        
        # Show frame locally for debugging
        cv2.imshow("Image", frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return detected_objects

def send_data_to_cloud():
    while True:
        gps_data = ser.readline().decode().strip()
        if gps_data:
            response = requests.post("http://yourserver.com/api/data", json={
                "gps": gps_data,
                "battery": get_battery_level(),
                "load": get_garbage_load(),
                "cpu_temp": CPUTemperature().temperature
            })
        time.sleep(5)

def get_battery_level():
    return 50 # Placeholder for actual battery level reading

def get_garbage_load():
    return 15 # Placeholder for actual load reading

if __name__ == '__main__':
    threading.Thread(target=detect_garbage).start()
    threading.Thread(target=send_data_to_cloud).start()
