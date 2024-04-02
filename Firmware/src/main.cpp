#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/*
TODO when starting everything up:
1) go to azure DB and add your IP address to whitelist
2) check IP address of website host
3) check WiFi info
4) launch website (npm start)
5) profit
*/

const char *ssid = "BlueBloodBrlek";
const char *password = "brlek123";
const char *endpointHostIP = "192.168.90.171"; // Replace with your website's IP address
const int encoderPinA = 18;                    // Rotary encoder pin A
const int encoderPinB = 19;                    // Rotary encoder pin B
const int buttonPin = 23;                      // Button pin

const int toggleFoodButton = 5; // Toggle button pin

volatile int encoderPos = 0;
volatile int lastEncoderPos = 0;
volatile bool encoderChanged = false;
int selectedFoodIndex = 0; // Index of the currently selected food item

int lastButtonState = LOW;
int lastFoodToggleButtonState = LOW;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 200;

String lastDisplayedMessage = "";

#define NUM_FOOD_ITEMS 2

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Enum to represent food names
enum Food
{
  Jabuka,
  Orah
};

// Array to map food index to food names
const char *foodNames[NUM_FOOD_ITEMS] = {
    "Jabuka",
    "Orah"};

void displayText(const String &message)
{
  if (message == lastDisplayedMessage)
  {
    return;
  }
  lastDisplayedMessage = message;
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(message);
  display.display();
}

void sendUpdateRequest(int valueChange)
{
  HTTPClient http;

  Serial.println("Sending update request...");
  // Endpoint for updating values
  String url = "http://" + String(endpointHostIP) + ":3000/update";

  // Sending a JSON payload with the new value change and selected food item
  String payload = "{\"foodIndex\": " + String(selectedFoodIndex) + ", \"newValue\": " + String(valueChange) + "}";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0)
  {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode == 400)
    {
      // newValue is too low, print error message on OLED screen
      displayText("Error: Value too low");
      delay(2000);
    }
    if (httpResponseCode == 200 || httpResponseCode == 201)
    {
      // Check if the response code indicates a low resource warning
      if (httpResponseCode == 201)
      {
        // Display low resource warning message
        displayText("Update successful    Low resource warning");
        delay(2000);
      }
      else
      {
        // Display regular update successful message
        displayText("Update successful");
        delay(2000);
      }
    }
    else
    {
      displayText("Something went awry");
      delay(2000);
    }
  }
  else
  {
    Serial.println("HTTP Request failed");
  }

  http.end();
}

void updateEncoder()
{
  int MSB = digitalRead(encoderPinA);
  int LSB = digitalRead(encoderPinB);
  int encoded = (MSB << 1) | LSB;
  int sum = (lastEncoderPos << 2) | encoded;

  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011)
  {
    encoderPos++;
    encoderChanged = true;
  }
  else if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000)
  {
    encoderPos--;
    encoderChanged = true;
  }
  lastEncoderPos = encoded;
}

void toggleFoodItem()
{
  selectedFoodIndex = (selectedFoodIndex + 1) % NUM_FOOD_ITEMS; // NUM_FOOD_ITEMS is the total number of food items
  displayText("Food selected: " + String(foodNames[selectedFoodIndex]));
}

void setup()
{
  Serial.begin(115200);
  pinMode(encoderPinA, INPUT);
  pinMode(encoderPinB, INPUT);
  pinMode(buttonPin, INPUT_PULLDOWN);
  pinMode(toggleFoodButton, INPUT_PULLDOWN);

  attachInterrupt(digitalPinToInterrupt(encoderPinA), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(encoderPinB), updateEncoder, CHANGE);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
      ;
  }
  display.display();
  delay(2000); // Pause for 2 seconds
  display.clearDisplay();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());
}

void loop()
{
  if (encoderChanged)
  {
    // Display the selected value on OLED screen
    displayText("Value: " + String(encoderPos));
    encoderChanged = false;
  }

  int buttonState = digitalRead(buttonPin);
  int toggleFoodButtonState = digitalRead(toggleFoodButton);
  // Serial.print("Button state: ");
  // Serial.println(buttonState);

  if ((millis() - lastDebounceTime) > debounceDelay)
  {
    if (buttonState == HIGH && buttonState != lastButtonState)
    {
      // Button pressed, send update request with encoderPos value
      displayText("Processing order...");
      sendUpdateRequest(encoderPos);

      lastDebounceTime = millis();
    }
    if (toggleFoodButtonState == HIGH && toggleFoodButtonState != lastFoodToggleButtonState)
    {
      toggleFoodItem();
      lastDebounceTime = millis();
    }
    lastButtonState = buttonState;
    lastFoodToggleButtonState = toggleFoodButtonState;
  }
}
