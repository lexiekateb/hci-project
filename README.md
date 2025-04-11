# HCI Project

## Instructions to Activate Extension
1. Download the repository to local
2. Go to chrome://extensions/.
3. At the top right, turn on Developer mode.
4. Click Load unpacked.
5. Find and select the app or extension folder.

This should activate the extension.

## Instructions to Activate Backend
1. Install Docker.
2. Set the backend folder as the working directory. 
```bash 
cd backend
```
3. Run Docker Compose.
```bash
docker compose create
```
4. Run Docker Container.
```bash
docker compose start
```
5. Verify that the container is running.
```bash
docker ps
```


## Text Moderation 
1. Create a file `backend/.env`
2. Add `OPENAI_API_KEY` to the .env file.
3. Setup dependencies.
```bash
uv sync
source .venv/bin/activate
```
4. Run cron.py.
```bash
uv run cron.py
```