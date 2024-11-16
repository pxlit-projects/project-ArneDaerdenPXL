# Architecture

## C4 Container Diagram Documentation: Internal News Management System

### Introduction / Purpose

This document provides a detailed overview of the container-level architecture for the **Internal News Management System**. The system allows **Editors** to create, review, approve, and publish internal news articles, while **Employees** can view published articles and add comments. The primary goal of this system is to keep employees informed with the latest news and enable easy collaboration and approval processes for editors.

### Users
1. **Editor**: Creates, reviews, approves, and publishes articles.
2. **Employee**: Views published articles and can leave comments.

### System Overview
The application consists of three primary microservices:
1. **PostService**: Manages article creation, storage, and retrieval.
2. **ReviewService**: Handles the review and approval workflow for articles.
3. **CommentService**: Allows employees to add comments on published articles.

Each microservice communicates through an **Event Bus** to enable decoupled, asynchronous interactions.

---

## Containers

### 1. Web Application (Frontend)
   - **Technology**: Angular
   - **Description**: Provides the user interface for both **Editors** and **Employees**.
   - **Responsibilities**:
     - **Editors**: Create, edit, and submit articles for review, view review status, and publish articles.
     - **Employees**: View published articles and post comments.
   - **Interactions**:
     - **PostService**: Fetches articles for display.
     - **ReviewService**: Sends articles for review and publishes approved ones.
     - **CommentService**: Sends and retrieves comments on published articles.

### 2. PostService
   - **Technology**: Spring Boot
   - **Description**: Handles article creation, storage, and retrieval.
   - **Responsibilities**:
     - Stores article drafts and published articles.
     - Provides endpoints for creating, editing, and retrieving articles.
     - Publishes events when new articles are created or edited.
   - **Interactions**:
     - **Event Bus**: Sends "ArticleCreated" and "ArticleUpdated" events.
     - **ReviewService**: Receives requests to initiate the review workflow and get the status.
     - **OpenFeign**: If needed, communicates with other services (e.g., ReviewService) to fetch or update article statuses.

### 3. ReviewService
   - **Technology**: Spring Boot
   - **Description**: Manages the article review and approval process.
   - **Responsibilities**:
     - Receives and tracks articles submitted for review.
     - Allows editors to approve or reject articles.
     - Publishes "ArticleApproved" and "ArticleRejected" events.
   - **Interactions**:
     - **Event Bus**: Sends events on approval or rejection. Listens for "ArticleCreated" to initiate reviews.
     - **PostService**: Notifies PostService to publish articles once approved.
     - **OpenFeign**: Uses OpenFeign to interact with PostService to get articles or update statuses via REST APIs if needed.

### 4. CommentService
   - **Technology**: Spring Boot
   - **Description**: Allows employees to add comments on published articles.
   - **Responsibilities**:
     - Stores and retrieves comments for each article.
     - Provides endpoints for posting, editing, and retrieving comments.
   - **Interactions**:
     - **Event Bus**: Listens to "ArticlePublished" events to enable commenting on new articles.
     - **PostService**: Queries for article details when needed to validate comments.

### 5. Event Bus
   - **Technology**: RabbitMQ
   - **Description**: Facilitates asynchronous, decoupled communication between microservices.
   - **Responsibilities**:
     - Publishes and subscribes to events across microservices.
   - **Events**:
     - **From PostService**: `ArticleCreated`, `ArticleUpdated`
     - **From ReviewService**: `ArticleApproved`, `ArticleRejected`
     - **From CommentService**: `CommentAdded`

### 6. API Gateway
   - **Technology**: Spring Cloud Gateway (or other suitable solutions like Zuul)
   - **Description**: The API Gateway is responsible for routing incoming requests to the appropriate microservices, implementing security, rate limiting, and centralizing logging and monitoring.
   - **Responsibilities**:
     - Routes incoming API requests to the correct microservices (PostService, ReviewService, CommentService).
     - Provides a centralized access point for the user interface.
     - Implements security features like authentication and authorization.
   - **Interactions**:
     - **Web Application**: Sends API requests to the API Gateway.
     - **PostService, ReviewService, CommentService**: The API Gateway routes requests to the appropriate microservices.

### 7. Config Service
   - **Technology**: Spring Cloud Config
   - **Description**: The Config Service manages configuration settings for all microservices in the application. It centralizes configuration details like database access, application settings, and other sensitive information.
   - **Responsibilities**:
     - Manages configuration settings for PostService, ReviewService, and CommentService.
     - Enables dynamic configuration loading without requiring service restarts.
   - **Interactions**:
     - **PostService, ReviewService, CommentService**: These microservices fetch their configurations from the Config Service.

### 8. Eureka Server (Service Discovery)
   - **Technology**: Spring Cloud Eureka
   - **Description**: Eureka Server is a service discovery platform that enables microservices to find and communicate with each other without manually configuring their IP addresses.
   - **Responsibilities**:
     - Keeps track of active microservices and their network locations.
     - Allows other microservices to register and discover their availability.
   - **Interactions**:
     - **PostService, ReviewService, CommentService**: These microservices register with the Eureka Server to be discoverable by other services.

---

## Event Descriptions

| Event           | Origin       | Purpose                                          | Consumed by             |
|-----------------|--------------|--------------------------------------------------|--------------------------|
| `ArticleCreated`| PostService  | Notifies ReviewService of a new article draft.    | ReviewService            |
| `ArticleApproved` | ReviewService | Signals PostService to publish the article.   | PostService              |
| `CommentAdded`   | CommentService | Adds a new comment to an article.             | PostService              |

---

## Interactions and Flow (Updated)

1. **Web Application**: Sends all incoming requests to the **API Gateway**.
2. **API Gateway**: Routes requests to the appropriate microservice (such as **PostService**, **ReviewService**, or **CommentService**) based on the route.
3. **Microservices**: Register with the **Eureka Server** for service discovery and fetch configurations from the **Config Service**.
4. **Service Interactions**: Microservices continue to communicate via the **Event Bus** as described in the previous documentation, with events such as **ArticleCreated**, **ArticleApproved**, and **CommentAdded** being pushed by the services.

---

## Sequence of Events

- **ArticleCreated**: Emitted by **PostService** when an article is drafted. **ReviewService** listens to initiate review.
- **ArticleApproved/Rejected**: Emitted by **ReviewService** after review. **PostService** listens to publish or archive the article.
- **ArticlePublished**: Emitted by **PostService** on publication. **CommentService** listens to enable commenting.
- **CommentAdded**: Emitted by **CommentService** when an employee adds a comment, allowing **PostService** to update the comment count.

[View Internal News Management System Architecture](./FullStack-Java-Architectuur.pdf)