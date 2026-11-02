# NetRescue – Network Failure Detection and Auto-Routing System

## 1. Project Title

**NetRescue: Network Failure Detection and Auto-Routing System**

A Computer Networks Lab Project.

## 2. Project Description

NetRescue is a network simulation and monitoring application designed to demonstrate how network failures can be detected and how alternative routes can be calculated automatically.

The system represents a computer network using nodes (computers and routers) and edges (network connections). It uses the Dijkstra shortest-path algorithm to calculate the best route between two computers.

When a network connection fails, NetRescue identifies the failed link, updates the network topology, and calculates an alternative route if one is available.

The application provides a visual dashboard where users can observe the network topology, packet movement, connection status, routing information, and network events.

The main objective is to demonstrate network failure detection and automatic route recalculation through an interactive simulation.

## 3. Features

- **Interactive Network Topology:** Visual representation of computers, routers, and network connections.
- **Network Failure Simulation:** Simulate the failure of a network connection.
- **Automatic Route Recalculation:** Calculate an alternative path when a connection fails.
- **Shortest Path Algorithm:** Uses Dijkstra's algorithm to identify the shortest available route.
- **Live Packet Animation:** Visually demonstrates packet movement along the selected route.
- **Network Monitoring Dashboard:** Displays routers, total links, active links, and failed links.
- **Network Event Logs:** Records simulation events, connection failures, and route changes.
- **Simulation Controls:** Start, fail a connection, and reset the network.
- **Routing Information:** Displays the original route and the alternative route with their respective costs.
- **Lightweight Web Interface:** Provides an interactive and responsive dashboard.

## 4. Technologies Used

### Frontend
- React.js
- TypeScript
- Vite
- React Flow
- Lucide React
- CSS

### Backend
- Python 3.11
- FastAPI
- NetworkX
- Uvicorn

### Algorithm
- Dijkstra's Shortest Path Algorithm

## 5. Software Requirements

| Requirement | Specification |
|---|---|
| Operating System | Windows 10/11, Linux or macOS |
| Programming Language | Python 3.11, TypeScript |
| Frontend Framework | React.js |
| Backend Framework | FastAPI |
| Network Graph Library | NetworkX |
| Network Visualization | React Flow |
| Runtime Environment | Node.js and Python |
| Code Editor | Visual Studio Code |
| Browser | Google Chrome, Microsoft Edge or Firefox |

## 6. Hardware Requirements

| Component | Minimum Requirement |
|---|---|
| Processor | Intel or AMD Dual-Core |
| RAM | 4 GB |
| Storage | 500 MB free space |
| Display | 1366 × 768 resolution |
| Network | Internet connection for initial dependency installation |

## 7. Project Architecture

The application follows a frontend-backend architecture.

### Frontend
The React frontend provides the dashboard, network topology visualization, simulation controls, packet animation, routing information, and event history.

### Backend
The FastAPI backend handles simulation requests, maintains the network state, detects simulated link failures, and calculates alternative routes.

### Routing Engine
NetworkX represents the network as a graph and calculates the shortest available route using Dijkstra's algorithm.

### Working Flow

1. The user opens the NetRescue dashboard.
2. The frontend requests the network state from the backend.
3. The backend initializes the network topology.
4. The routing algorithm calculates the shortest path.
5. The user starts the packet transmission simulation.
6. The user can simulate a network connection failure.
7. The backend removes the failed connection from the active graph.
8. The routing algorithm calculates an alternative path.
9. The frontend updates the topology and packet animation.

## 8. Steps to Run the Project

### Prerequisites

Install the following software:

- Python 3.11
- Node.js and npm
- Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/NetRescue.git
```

Navigate to the project directory:

```bash
cd NetRescue
```

### Step 2: Start the Backend

Navigate to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 3: Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

### Step 4: Run the Simulation

1. Open the NetRescue dashboard.
2. View the initialized network topology.
3. Click the Start button to begin packet transmission.
4. Click Fail Link (R2–R3) to simulate a network failure.
5. Observe the failed connection and alternative route.
6. Check the routing information and network event logs.
7. Click Reset to restore the original network.

## 9. Example Simulation

The sample network contains two endpoint computers and five routers.

### Original Route

```text
A → R1 → R2 → R3 → E
```

Total route cost: **8**

### Simulated Network Failure

The connection between R2 and R3 is disconnected.

### Alternative Route

```text
A → R1 → R4 → R5 → R3 → E
```

Total alternative route cost: **9**

The system calculates the alternative route and updates the network visualization.

## 10. Screenshots

Add screenshots of your actual running application in this section.

### 10.1 NetRescue Dashboard

![NetRescue Dashboard](screenshots/dashboard.png)

### 10.2 Network Topology

![Network Topology](screenshots/topology.png)

### 10.3 Packet Transmission

![Packet Transmission](screenshots/packet-transmission.png)

### 10.4 Network Failure Detection

![Network Failure Detection](screenshots/failure-detection.png)

### 10.5 Automatic Route Recalculation

![Alternative Route](screenshots/alternative-route.png)

*Note: Create a `screenshots` folder in the repository and add the corresponding actual screenshots.*

## 11. Project Limitations

- The current application uses a simulated network topology.
- Network failures are triggered through the dashboard controls.
- Packet movement is a visual simulation and does not represent actual packet capture.
- The current version does not configure physical routers or automatically change their routing tables.
- Network metrics displayed by the prototype are illustrative simulation values.

## 12. Future Enhancements

- Real-time monitoring of network devices.
- Ping-based connectivity checking.
- Integration with Mininet for virtual network emulation.
- Support for additional routing algorithms.
- Multiple packet transmission.
- Detailed network performance analysis.
- Integration with real routing protocols such as OSPF.

## 13. Conclusion

NetRescue demonstrates the concepts of network failure detection, shortest-path routing, and automatic route recalculation through an interactive network simulation.

By using React, FastAPI, and NetworkX, the project provides a visual and understandable way to study how networks can respond to connection failures and identify alternative communication paths.

The project helps demonstrate the importance of routing algorithms and fault tolerance in computer networks.

## 14. References

1. NetworkX Documentation – https://networkx.org/documentation/stable/
2. NetworkX Shortest Path Algorithms – https://networkx.org/documentation/stable/reference/algorithms/shortest_paths.html
3. FastAPI Documentation – https://fastapi.tiangolo.com/
4. React Documentation – https://react.dev/
5. React Flow Documentation – https://reactflow.dev/
6. Python Documentation – https://docs.python.org/3/
7. Edsger W. Dijkstra, A Note on Two Problems in Connexion with Graphs, 1959.

---

**Project:** NetRescue  
**Subject:** Computer Networks Lab  
**Project Type:** Network Failure Detection and Auto-Routing Simulation
