# Baby Monitoring System

A comprehensive IoT-based baby monitoring system with real-time sensor data tracking for temperature, humidity, and sound levels.

## Project Structure

This project is organized into two main components:

### Frontend

The frontend is a React/Vite application that displays sensor data in real-time and provides notifications when readings exceed thresholds.

- Location: `/frontend`
- Tech Stack: React, TypeScript, Vite, TailwindCSS
- Features:
  - Real-time sensor data display
  - Historical data charts
  - Notification system (app, browser, email, SMS)
  - User authentication
  - Threshold configuration

### Backend

The backend is a Node.js/Express server that handles IoT data and provides API endpoints for the frontend.

- Location: `/backend`
- Tech Stack: Node.js, Express
- Features:
  - API endpoints for sensor data
  - IoT device integration
  - Data simulation for testing

## Getting Started

### Running the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

### Running the Frontend

1. In the root directory, install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Deploying to Render

This project is configured for easy deployment to Render.

#### Backend Deployment

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure with these settings:
   - **Name**: baby-monitoring-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Directory**: `server`
4. Add environment variables:
   - `NODE_ENV`: production
   - `API_KEY`: your-secret-api-key
   - `DEVICE_ID`: baby-monitor-01

#### Frontend Deployment

1. Create a new Static Site in Render
2. Connect your GitHub repository
3. Configure with these settings:
   - **Name**: baby-monitoring-client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables if needed

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   The server will run on http://localhost:3000

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   The frontend will be available at http://localhost:5173

## Sending IoT Data

You can send data to the backend server from your IoT devices using HTTP POST requests to:

```
POST http://localhost:3000/api/sensor-data
```

With a JSON body containing sensor readings:

```json
{
  "temperature": 24.5,
  "humidity": 45,
  "sound": 35
}
```

For testing without actual IoT devices, you can use the simulate endpoint:

```
GET http://localhost:3000/api/simulate
```
