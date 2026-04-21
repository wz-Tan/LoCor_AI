# LoCor AI

Using Z-AI

---

# Redis Setup Instructions

# Redis Setup Guide

---

## Mac

### Install
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Redis
brew install redis
```

### Start
```bash
brew services start redis
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
brew services stop redis
```

### Restart
```bash
brew services restart redis
```

---

## Windows

### Install
```powershell
# 1. Open PowerShell as Administrator and enable WSL2
wsl --install

# 2. Restart your PC, then open Ubuntu terminal and run:
sudo apt update
sudo apt install redis-server -y
```

### Start
```bash
sudo service redis-server start
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
sudo service redis-server stop
```

### Restart
```bash
sudo service redis-server restart
```

> ⚠️ **Note:** WSL does not auto-start on reboot. You will need to run `sudo service redis-server start` every time you restart your PC.

---

## Linux (Ubuntu/Debian)

### Install
```bash
sudo apt update
sudo apt install redis-server -y
```

### Start
```bash
sudo systemctl start redis
```

### Enable auto-start on reboot
```bash
sudo systemctl enable redis
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
sudo systemctl stop redis
```

### Restart
```bash
sudo systemctl restart redis
```

---

## Python Client (All Platforms)

```bash
pip install redis
```

```python
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
```

---

## Optimization

### Uses TOON Instead of JSON

Reduces token usage by ~25-30%, allowing for a faster model processing

### Redis Caching (TODO Maybe)

Prevents duplicative API calls within a short timeframe. Enhances data retrieval speed

---

