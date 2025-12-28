# LifeLink – Emergency First Responder Network

Live prototype here:  
https://life-link-topaz.vercel.app/

---

## 🚨 Overview

LifeLink is an emergency response platform designed to reduce critical response times during medical emergencies. It provides a one-tap distress system that connects the user to nearby registered responders such as auto drivers, bike riders, police patrol units, night guards, and volunteers, ensuring rapid assistance before formal ambulances arrive.

LifeLink enhances public health governance by mobilizing local transportation and community resources in emergency situations.

---

## 📌 Problem Statement

In many urban and rural regions of India, ambulance services often take 20–40 minutes to reach an emergency location. During night time or in low-population zones, immediate local help is even scarcer, increasing the risk of critical outcomes.

There is currently no organized system that instantly mobilizes nearby mobility resources in such emergencies.

---

## 💡 Proposed Solution

LifeLink enables users to trigger a distress signal with one tap. The system then shares the user’s live location and emergency type with nearby registered responders. The fastest available responder can accept the request and help transport the patient to the nearest hospital, while the system also notifies a fallback contact or SMS if needed.

---

## ✅ Round-1 Prototype Features

These features are implemented and demonstrated in the prototype:

### 📱 Core Functionality
- **One-Tap Emergency Distress Button**
- **Automatic Live GPS Location Sharing**
- **Nearby Responder Finder**
- **Responder Request Accept / Reject**
- **Nearest Hospital Detection**
- **Push + SMS Notification Fallback**

### 🔎 Governance & Accountability
- **Emergency Request Logging Dashboard**
- **Good Samaritan Protection Display**
- **Live Status Tracking**

### 📺 Demo
The prototype can be accessed here:  
👉 https://life-link-topaz.vercel.app/

---

## 🧠 System Flowchart

```text
+------------------+
|   User in Need   |
+------------------+
         |
         | Press Distress Button
         v
+-------------------------+
|   LifeLink Mobile App   |
+-------------------------+
         |
         | Sends GPS + Emergency Type
         v
+---------------------------+
|     LifeLink Backend      |
+---------------------------+
         |
   +-----+-----+-----+
   |           |     |
   v           v     v
Nearby     Nearest  SMS Fallback
Responders Hospital (if data fails)
   |           |
   | Accept    | Alert
   v           v
+---------------------------+
|   Emergency Rescue Starts |
+---------------------------+
         |
         v
+---------------------------+
|   Rescue Logged on Admin  |
+---------------------------+
```
## 📊 Data Flow (DFD – Level 0)
```text
[ User ]
    |
    | Emergency Request
    v
( LifeLink System )
    |
    +------> [ Responders ]
    |
    +------> [ Hospitals ]
    |
    +------> [ SMS Gateway ]
    |
    +------> [ Admin Dashboard ]
```

## 🧩 Component Architecture
```text
+-------------------------+
|      Mobile App        |
|-------------------------|
| Distress Button        |
| Live Location          |
| Hospital Finder        |
| Status Tracking        |
+-----------+-------------+
            |
            v
+-------------------------+
|     Backend Server     |
|-------------------------|
| Responder Matching     |
| Emergency Dispatcher   |
| Logs & Analytics       |
+-----------+-------------+
            |
    +-------+--------+
    |                |
    v                v
Responder App   Hospital APIs
```

## 🛡Governance Flow
```text
Emergency Report
        |
        v
Responder Verification
        |
        v
Good Samaritan Protection
        |
        v
Health Department Log

```
## 📹 Video Overview
We will prepare a short video walkthrough (~1–2 minutes) demonstrating:

- User tapping the distress button
- Live location capture
- Responder notification
- Nearest hospital detection
- Emergency log in dashboard

The video will be linked here when uploaded:

👉 Add YouTube or Drive link here


## 🚀 Planned Features for Round-2

These features may be added in Round-2 for scaling, sustainability, and production readiness:

### 📍 Advanced System Enhancements

- Integration with Government Ambulance APIs
- Traffic-Aware ETAs with Live Navigation
- Offline Distress Beacon Mode
- Machine Learning for Response Prioritization

### 💰 Responder Incentive Framework

- Real monetary compensation
- Insurance & liability protection
- Reward points & government badges

### 📊 Governance Analytics Dashboard

- Heatmap of emergency density
- Responder performance metrics
- Time-to-response analysis

### 🤝 Stakeholder Integrations

- Local police and public health systems
- Hospitals network
- Emergency call centers

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React.js + Next.js |
| Styling | Tailwind CSS |
| Backend | Firebase |
| Database | Cloud Firestore |
| Authentication | Firebase Auth |
| Notifications | Firebase Cloud Messaging (FCM) |
| Maps & Location | Leaflet + OpenStreetMap |
| SMS Fallback | MSG91 / Twilio |
| Dashboard | Next.js Admin Panel |
| Hosting | Vercel / Firebase Hosting |

## 🌍 Impact

### LifeLink aims to:

- Reduce emergency response times to under 5 minutes
- Save lives in the critical golden hour
- Reduce pressure on ambulances
- Provide a transparent governance model for emergency services


## 👥 Team

| Name           | Role                 |
|---------------|----------------------|
| Vansh Pandey  | Team Leader & Coder  |
| Kartik Upadhyay | Coder               |
| Yash Agarwal  | UI / UX Designer     |
| Vishal Hotwani| Research & Analysis  |
