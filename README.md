# ⚡ Action Panel Widget (ArcGIS Experience Builder)

## 📌 Overview
### This is a custom control panel widget built using React + TypeScript for ArcGIS Experience Builder
### It provides interactive tools to control and analyze GIS layers like substations, HT/LT lines, and feeders

---

## 🚀 Features

### - 🔍 Zoom to Substations
### - ⚡ Toggle HT Lines (ON/OFF)
### - 🔌 Toggle LT Lines (ON/OFF)
### - ❌ Clear Selection (graphics & popups)
### - 🔎 Find Feeder (attribute-based search)
### - 🧪 Run Analysis (feature count across layers)
### - ✅ Validate Data (detect empty layers)
### - 📡 Map connection status
### - 🔔 Toast notifications

---

## 🧠 Built With

### React (Hooks)
### TypeScript
### ArcGIS API for JavaScript
### ArcGIS Experience Builder SDK

---

## 📂 Project Structure

### widget/
### ├── widget.tsx        (Main widget logic)
### ├── setting.tsx       (Widget settings panel)
### ├── config.ts         (Configuration interface)
### ├── manifest.json     (Widget metadata)

---

## ⚙️ Installation

### Step 1: Clone Experience Builder project
### Step 2: Navigate to widgets folder
### cd client/your-extensions/widgets
### Step 3: Add this widget folder
### Step 4: Restart Experience Builder

---

## 🔧 Configuration

### Step 1: Open Experience Builder
### Step 2: Drag widget into page
### Step 3: Open settings (⚙️)
### Step 4: Select Web Map

---

## 🗺️ How It Works

### Uses JimuMapViewComponent to connect to map
### Accesses feature layers
### Performs:
### - Query
### - Visibility toggle
### - Zoom
### - Popup display

---

## 🎯 Use Cases

### Utility Network Applications
### Electricity boards
### Infrastructure GIS
### Smart city dashboards

---

## 🧩 Future Enhancements

### Feeder tracing (network analysis)
### Multi-feature selection
### Charts & dashboards
### API integration
### User roles & permissions

---

## 👨‍💻 Author

### GIS Developer (React + ArcGIS)

---

## 📌 Notes

### Requires Web Map
### Layer naming matters:
### - HT Line
### - LT Line
### - Substation

### Attribute required:
### FeederId

---

## 🧠 Summary

### Combines:
### - GIS concepts
### - ArcGIS platform
### - React development

## Result:
### A real-world Web GIS control panel
