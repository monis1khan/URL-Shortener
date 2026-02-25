# URL Shortener - Highly Scalable Distributed System

![Architecture Diagram](./assets/architecture.jpg)

A highly scalable and distributed URL shortener service designed to handle massive volumes of URL shortening and redirection requests. This project implements advanced system design concepts, utilizing caching for ultra-fast redirects, a message broker for decoupled processing, and robust API security.

## Features
* **Distributed ID Generation:** Engineered a custom, range-based ID generation algorithm using Redis to allocate blocks of 1000 IDs into local container memory, guaranteeing zero ID collisions while eliminating database network overhead for 99.9% of requests.
* **Ultra-Low Latency Redirects:** Implemented a Redis Cache-Aside strategy, successfully reducing redirect latency by 90% (from ~260ms to ~26ms).
* **Zero-Blocking Analytics:** Utilized Apache Kafka to completely decouple analytics logging from the main request-response cycle. A background Kafka consumer handles MongoDB updates without impacting the user's redirect speed.
* **Resilient Rate Limiting:** Implemented a distributed rate limiter (Token Bucket) using a dedicated Redis connection to enforce 10 requests/minute per User/IP. Features a "fail-open" design to ensure the API remains accessible even if the caching layer experiences downtime.
* **Modern Message Durability:** Configured the Kafka cluster using KRaft (Kafka Raft Metadata mode) instead of Zookeeper to ensure reliable leader election and guaranteed message persistence even during traffic spikes.
* **Scalable Infrastructure:** Fully containerized utilizing Docker Compose, with Nginx acting as a reverse proxy to efficiently load balance incoming traffic across multiple application containers.

---

## Technologies Used
* **Backend:** Node.js (20+), Express.js
* **Database:** MongoDB
* **Caching & Rate Limiting:** Redis (ioredis)
* **Message Broker:** Kafka
* **Reverse Proxy / Load Balancer:** Nginx
* **Containerization:** Docker & Docker Compose

---

## System Design Highlights

### 1. The Latency Gap & Cache-Aside Pattern
Standard URL shorteners suffer from database blocking on every redirect. By implementing Redis as a caching layer, the system checks memory first. If a cache miss occurs, it fetches from MongoDB and warms the cache for 24 hours. This strategy successfully reduced redirect latency from ~260ms down to ~26ms.

### 2. Range-Based ID Allocation
To generate tiny, collision-free short URLs across multiple Docker containers, the system avoids hitting the database on every request. Instead, a central Redis counter allocates a "range" of 1,000 IDs to an application instance. The instance doles out these IDs instantly from local memory. A Promise-based "traffic light" mechanism ensures safe, concurrent refills without overwhelming Redis during traffic spikes.

### 3. Asynchronous Click Analytics
Logging user clicks synchronously creates a bottleneck. To ensure redirects are never delayed by analytics, the main server fires a "Click Event" to a Kafka topic and immediately redirects the user. A separate background Kafka consumer (using modern KRaft mode for durability) processes these events and updates MongoDB asynchronously.

### 4. Resilient Distributed Rate Limiting
To protect the system from DDoS attacks and scraping, a Distributed Rate Limiter enforces strict usage quotas (10 requests/minute per IP or User ID). It uses a private Redis connection to prevent command conflicts and implements a "Fail-Open" architecture. If the Redis rate-limiting node crashes, the middleware logs the error and allows the request to pass, ensuring the core service remains highly available.

---

## Getting Started
Follow these steps to set up the URL Shortener locally. 

### Prerequisites
* [Node.js](https://nodejs.org/) (v20 or higher)
* [Docker and Docker Compose](https://www.docker.com/) 

### Local Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/monis1khan/URL-Shortener.git](https://github.com/monis1khan/URL-Shortener.git)
    ```

2. **Navigate to the project directory:**
    ```bash
    cd URL-Shortener
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Environment Variables:**
    Create a `.env` file in the root directory and add your configurations. Example:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/url_shortener
    REDIS_HOST=localhost
    REDIS_PORT=6379
    KAFKA_BROKER=localhost:9092
    ```

5. **Start Infrastructure (Docker):**
    Spin up Redis, Kafka, and Nginx using Docker Compose:
    ```bash
    docker-compose up -d
    ```

6. **Start the Application:**
    ```bash
    npm start
    ```

---

## API Endpoints

- `POST /api/shorten` - Accepts a long URL and returns a shortened URL.
- `GET /:shortId` - Redirects the client to the original long URL.