#include <Wire.h>
#include <Servo.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

// GPS setup
TinyGPSPlus gps;
SoftwareSerial gpsSerial(4, 3); // RX, TX for GPS module

// Motor control pins
#define LEFT_MOTOR_PIN1 5
#define LEFT_MOTOR_PIN2 6
#define RIGHT_MOTOR_PIN1 9
#define RIGHT_MOTOR_PIN2 10
#define CONVEYOR_MOTOR_PIN1 11
#define CONVEYOR_MOTOR_PIN2 12

// Ultrasonic Sensor Pins
#define TRIG_PIN 8
#define ECHO_PIN 7

// Battery and Load Sensor Pins
#define BATTERY_PIN A0
#define LOAD_SENSOR_PIN A1

#define MAX_GARBAGE_CAPACITY 25.0 // kg
#define MIN_BATTERY_LEVEL 20 // 20%

float garbage_collected = 0.0;
float battery_level = 100.0;

void setup() {
  Serial.begin(9600); // For debugging
  gpsSerial.begin(9600); // For GPS

  pinMode(LEFT_MOTOR_PIN1, OUTPUT);
  pinMode(LEFT_MOTOR_PIN2, OUTPUT);
  pinMode(RIGHT_MOTOR_PIN1, OUTPUT);
  pinMode(RIGHT_MOTOR_PIN2, OUTPUT);
  pinMode(CONVEYOR_MOTOR_PIN1, OUTPUT);
  pinMode(CONVEYOR_MOTOR_PIN2, OUTPUT);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BATTERY_PIN, INPUT);
  pinMode(LOAD_SENSOR_PIN, INPUT);
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Check battery level
  battery_level = analogRead(BATTERY_PIN) * (5.0 / 1023.0) * 100;

  // Check load sensor
  garbage_collected = analogRead(LOAD_SENSOR_PIN) * (5.0 / 1023.0) * 50;

  if (garbage_collected >= MAX_GARBAGE_CAPACITY || battery_level <= MIN_BATTERY_LEVEL) {
    Serial.println("LOW BATTERY or FULL LOAD, RETURN TO BASE!");
    returnToBase();
  }

  // Obstacle detection
  if (detectObstacle()) {
    Serial.println("Obstacle detected!");
    avoidObstacle();
  } else {
    Serial.println("Navigating to garbage.");
    navigateToGarbage();
  }
  
  delay(100);
}

void returnToBase() {
  // Logic to navigate back to the base station
  stopMotors();
  // Implement GPS-based return navigation here
}

void navigateToGarbage() {
  // Move forward
  digitalWrite(LEFT_MOTOR_PIN1, HIGH);
  digitalWrite(LEFT_MOTOR_PIN2, LOW);
  digitalWrite(RIGHT_MOTOR_PIN1, HIGH);
  digitalWrite(RIGHT_MOTOR_PIN2, LOW);
  digitalWrite(CONVEYOR_MOTOR_PIN1, HIGH);
  digitalWrite(CONVEYOR_MOTOR_PIN2, LOW);
}

void stopMotors() {
  digitalWrite(LEFT_MOTOR_PIN1, LOW);
  digitalWrite(LEFT_MOTOR_PIN2, LOW);
  digitalWrite(RIGHT_MOTOR_PIN1, LOW);
  digitalWrite(RIGHT_MOTOR_PIN2, LOW);
  digitalWrite(CONVEYOR_MOTOR_PIN1, LOW);
  digitalWrite(CONVEYOR_MOTOR_PIN2, LOW);
}

bool detectObstacle() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  float duration = pulseIn(ECHO_PIN, HIGH);
  float distance = (duration * 0.0343) / 2;

  if (distance < 20) { // Less than 20 cm
    return true;
  }
  return false;
}

void avoidObstacle() {
  // Simple obstacle avoidance logic
  stopMotors();
  delay(500);
  digitalWrite(LEFT_MOTOR_PIN1, LOW);
  digitalWrite(LEFT_MOTOR_PIN2, HIGH);
  digitalWrite(RIGHT_MOTOR_PIN1, HIGH);
  digitalWrite(RIGHT_MOTOR_PIN2, LOW);
  delay(1000);
  stopMotors();
}



