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
3. Run Docker build.
```bash
docker build -t hci-backend-image .
```
4. Run Docker Container.
```bash
docker run -d -p 8000:8000 hci-backend-image
```
5. Verify that the container is running.
```bash
docker ps
```

## How to Find Local Storage (Deprecated)
Navigate to Whatsapp with the Chrome extension downloaded. Using Chrome's menu, go to More Tools > Developer Tools. On the top bar, click "Application." On the left, do the dropdown for "Local Storage." Here, you should see one sub-category for whatsapp web. Click this, scroll all the way down, and our chats are saved under "whatsapp_chats."