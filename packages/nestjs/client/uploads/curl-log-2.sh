## Request (2)
curl -X "POST" "https://log.verdent.ai/info" \
     -H 'Content-Type: application/json' \
     -d $'{
  "log_id": 1757994670639,
  "ct": "client",
  "log_type": 1,
  "common": {
    "app_id": 3,
    "app_version": "0.7.0-alpha.9",
    "os": {
      "release": "",
      "arch": "unknown",
      "cpus": {},
      "hostname": "unknown",
      "type": "unknown",
      "platform": "unknown"
    },
    "device_id": "c601a3cd3dd0d901f36c20d81cba1c6b875464b4e1dc1448fca428740006f7fc",
    "data": {
      "et_id": 4,
      "action_data": {
        "type": "display",
        "source": "home"
      }
    },
    "ide_version": "0.7.0-alpha.9",
    "user_id": "anymouse",
    "timestamp": 1757994670639,
    "ide_name": "Verdent Deck"
  },
  "version": "1.0"
}'
