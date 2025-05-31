# ESP32 MicroPython Code Overview and Guide for Flashing and Setup

#### Overview

The uploaded script is designed for a MicroPython environment, typically running on an ESP32 or ESP8266 microcontroller. Here's what the script does:

1. **CO2 Level Measurement**:

   * Reads pulse width modulation (PWM) signals from a sensor to calculate CO2 levels.
   * Saves CO2 measurements with timestamps to a local file (`co2_data.txt`).

2. **Wi-Fi Connectivity**:

   * Connects to a Wi-Fi network to enable network capabilities.
   * Provides an HTTP server to fetch CO2 records in JSON format.

3. **Time Synchronization**:

   * Synchronizes the device time using NTP.

4. **Data Storage and Pruning**:

   * Maintains a local file with a maximum of 100 records.

5. **HTTP Server**:

   * Serves CO2 data in JSON format through a RESTful endpoint.

---

#### Flashing MicroPython on Your Microcontroller

To run the script, you must first install MicroPython on your ESP32/ESP8266. Here’s how you can do it:

---

### Step 1: Install Required Tools

#### 1.1. **Install Python 3**

Ensure Python 3.x is installed on your system. Verify by running:

```bash
python3 --version
```

#### 1.2. **Install `esptool.py`**

Use `esptool.py` to flash the MicroPython firmware:

```bash
pip install esptool
```

#### 1.3. **Install `ampy`**

Use `ampy` to upload the script to the board:

```bash
pip install adafruit-ampy
```

---

### Step 2: Download MicroPython Firmware

Visit the [MicroPython website](https://micropython.org/download/) and download the appropriate firmware for your ESP32 or ESP8266.

---

### Step 3: Flash the MicroPython Firmware

1. **Put the Microcontroller in Bootloader Mode**:

   * For ESP32: Hold the `BOOT` button while powering on the device.
   * For ESP8266: Follow specific instructions for your board.

2. **Erase Flash Memory**:

   ```bash
   esptool.py --chip esp32 erase_flash
   ```

3. **Flash MicroPython Firmware**:
   Replace `firmware.bin` with the path to the downloaded firmware file.

   ```bash
   esptool.py --chip esp32 --port /dev/ttyUSB0 --baud 460800 write_flash -z 0x1000 firmware.bin
   ```

---

### Step 4: Upload the Script

1. **Connect the Microcontroller**:
   Ensure the microcontroller is connected to your computer via USB.

2. **Set Up `ampy`**:
   Replace `/dev/ttyUSB0` with the correct port for your device:

   ```bash
   export AMPY_PORT=/dev/ttyUSB0
   ```

3. **Upload the Script**:

   ```bash
   ampy put main.py
   ```

4. **Verify the Script**:
   Check if the script is uploaded correctly:

   ```bash
   ampy ls
   ```

---

If you prefer using `picocom` to monitor the serial output, here's how you can modify Step 5 for debugging with `picocom`:

---

### Step 5: Run the Script and Monitor Output

#### 5.1. **Install `picocom`**

Install `picocom` if it's not already available on your system:

```bash
sudo apt install picocom
```

#### 5.2. **Monitor Serial Output**

To connect to the microcontroller, run:

```bash
picocom /dev/ttyUSB0 -b 115200
```

* Replace `/dev/ttyUSB0` with the correct port for your device.
* `-b 115200` specifies the baud rate, which should match the MicroPython default.

#### 5.3. **Exit `picocom`**

To exit `picocom`, press:

```
Ctrl + A, then Ctrl + X
```

---

Using `picocom`, you can watch real-time logs from your script, including Wi-Fi connection status, HTTP server initialization, and CO2 measurement readings.

