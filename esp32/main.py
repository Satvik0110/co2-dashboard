import json
import os
from machine import Pin, time_pulse_us
from time import time, sleep, localtime
import network
import ntptime

pwm_pin = Pin(13, Pin.IN)
FILE_NAME = "co2_data.txt"
MAX_ENTRIES = 100
debug = True

def calculate_co2(th_high, th_low):
    th_high_ms = th_high / 1000
    th_low_ms = th_low / 1000
    return round(2000 * (th_high_ms - 2) / (th_high_ms + th_low_ms - 4), 2)

def init_storage():
    try:
        if FILE_NAME not in os.listdir():
            with open(FILE_NAME, "w") as f:
                f.write("")
    except:
        pass

def save_co2_reading(timestamp, co2_value):
    try:
        with open(FILE_NAME, "a") as f:
            f.write(f"{timestamp},{co2_value}\n")
        prune_storage()
    except:
        pass

def prune_storage():
    try:
        with open(FILE_NAME, "r") as f:
            lines = f.readlines()
        if len(lines) > MAX_ENTRIES:
            lines = lines[-MAX_ENTRIES:]
            with open(FILE_NAME, "w") as f:
                f.writelines(lines)
    except:
        pass

def fetch_records(n):
    try:
        with open(FILE_NAME, "r") as f:
            lines = f.readlines()
        records = [line.strip().split(",") for line in lines[-n:]]
        return json.dumps([{"timestamp": r[0], "co2": r[1]} for r in records])
    except:
        return json.dumps([])

def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while not wlan.isconnected():
        pass
    print(f"Connected to {ssid}! IP is {wlan.ifconfig()[0]}")
    return

def handle_request(conn):
    print("handling connection")
    try:
        request = conn.recv(1024).decode()
        if "/json" in request:
            reqsp = request.split("n=")
            print(reqsp)
            if len(reqsp) > 1:
                n = int( reqsp[-1].split(" ")[0] )
            else:
                n = 1
            data = fetch_records(n)
            response = f"HTTP/1.1 200 OK\nContent-Type: application/json\nAccess-Control-Allow-Origin: *\n\n{data}"
        else:
            response = "HTTP/1.1 404 Not Found\nAccess-Control-Allow-Origin: *\n\n"
        conn.sendall(response.encode('utf-8'))
    except:
        pass

def start_server():
    import socket
    addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(0)
    print("Listening on 0.0.0.0")
    while True:
        conn, _ = s.accept()
        print(f"client connected from {_}")
        handle_request(conn)
        conn.close()

def setup_time():
    ct = 0
    while ct < 100:
        ct += 1
        try:
            ntptime.settime()
            print("Synced time")
            now = localtime()
            print("Date: {}/{}/{}".format(now[2], now[1], now[0]))
            print("Time: {}:{}".format(now[3]+5, now[4]+30))
            return
        except:
            pass
    print("Failed to sync time, continuing")

def main():
    init_storage()
    # connect_wifi("SCRC_LAB_IOT", "Scrciiith@123")
    connect_wifi("Hem", "dingleberry")
    setup_time()
    sleep(2)
    while True:
        try:
            th_high = time_pulse_us(pwm_pin, 1)
            if th_high > 0:
                th_low = 1004*1000 - th_high
                co2_value = calculate_co2(th_high, th_low)
                timestamp = time()
                save_co2_reading(timestamp, co2_value)
                if debug:
                    print("ppm:",co2_value,"|",th_high/1000,th_low/1000,"|","network status:",network.WLAN(network.STA_IF).isconnected(),"[",network.WLAN(network.STA_IF).ifconfig()[0],"]")
        except:
            print("Timeout reading from sensor")
            pass
        sleep(2)

if __name__ == "__main__":
    import _thread
    _thread.start_new_thread(start_server, ())
    main()
