<h1 align="center">📱 Microservice-Based Social Media Platform</h1>

<p align="center">
  <b>Scalable, event-driven social media app built with Node.js, RabbitMQ, and PostgreSQL.</b>
  <br/><br/>
  <img src="https://img.shields.io/badge/Backend-NodeJS-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Framework-Express-blue?logo=express" />
  <img src="https://img.shields.io/badge/Queue-RabbitMQ-orange?logo=rabbitmq" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql" />
</p>

---

## 📚 Table of Contents

- [Motivation](#-motivation)
- [Why This Project?](#-why-this-project)
- [What I Learned](#-what-i-learned)
- [Technologies Used](#-technologies-used)
- [Main Idea](#-main-idea)
- [System Flow](#-system-flow)
- [Overall Architecture](#-overall-architecture)
- [License](#-license)

---

## 🚀 Motivation

We wanted to create a **social media platform** based on **microservice architecture** to achieve better scalability, modularity, and maintainability.

---

## 🎯 Why This Project?

This project is a **personal side-project** where I practiced **distributed systems** concepts using **RabbitMQ** for asynchronous communication between services.

---

## 🧠 What I Learned

- Backend development with **Node.js** and **Express**
- Building **microservices** with independent responsibilities
- Asynchronous messaging with **RabbitMQ**
- Reliable data persistence using **PostgreSQL**
- Event-driven communication patterns in distributed systems

---

## 🛠️ Technologies Used

| Technology | Purpose |
|:-----------|:--------|
| **Node.js** | Backend runtime environment |
| **Express** | API server and routing framework |
| **PostgreSQL** | Data storage for posts and user-generated content |
| **RabbitMQ** | Message broker for event-driven communication between services |

---

## 💡 Main Idea

- **Microservices** are used to separate concerns: Post, Search, and Media.
- **RabbitMQ** is used to decouple services and handle event-driven communication.
- The **API Gateway** acts as a single entry point for client requests, routing them to the appropriate services.
- Services **publish** and **consume** events for operations that affect multiple services.

---

## 🔄 System Flow

### Create Post

1. Client sends a **create post** request to the **API Gateway**.
2. API Gateway forwards the request to the **Post Service**.
3. Post Service **publishes** a `post.created` event to **RabbitMQ**.
4. **Search Service** and **Media Service** **consume** the `post.created` event:
   - Search Service indexes the new post.
   - Media Service prepares to process any attached media.

---

### Search Post

1. Client sends a **search** request to the **API Gateway**.
2. API Gateway forwards the request to the **Search Service**.
3. Search Service returns the search results back through the API Gateway to the Client.

---

### Upload Media

1. Client sends an **upload media** request to the **API Gateway**.
2. API Gateway forwards the request to the **Media Service**.
3. Media Service **publishes** a `media.uploaded` event to **RabbitMQ**.
4. **Post Service** consumes the `media.uploaded` event and updates the post with the media URL.
5. Upload success response flows back to the Client.

---

## 🖼️ Overall Architecture

<p align="center">
  <img src="https://i.imgur.com/kcYs4Da.png" alt="System Architecture" width="800">
</p>

---

## 📜 License

This project was developed for educational and practice purposes. Feel free to explore and modify it!

---
