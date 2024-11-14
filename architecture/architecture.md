# Architecture

# C4 Container Diagram Documentation: Internal News Management System

## Introduction / Purpose

This document provides a detailed overview of the container-level architecture for the **Internal News Management System**. The system allows **Editors** to create, review, approve, and publish internal news articles, while **Employees** can view published articles and add comments. The primary goal of this system is to keep employees informed with the latest news and enable easy collaboration and approval processes for editors.

## Users
1. **Editor**: Creates, reviews, approves, and publishes articles.
2. **Employee**: Views published articles and can leave comments.

## System Overview
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

---

## Event Descriptions

| Event           | Origin       | Purpose                                          | Consumed by             |
|-----------------|--------------|--------------------------------------------------|--------------------------|
| `ArticleCreated`| PostService  | Notifies ReviewService of a new article draft.    | ReviewService            |
| `ArticleApproved` | ReviewService | Signals PostService to publish the article.   | PostService              |
| `CommentAdded`   | CommentService | Adds a new comment to an article.             | PostService              |

---

## Interactions and Flow

1. **Article Creation and Review Workflow**:
   - **Editor** creates a new article in the **Web Application**, which calls **PostService**.
   - **PostService** saves the draft and emits an `ArticleCreated` event to the **Event Bus**.
   - **ReviewService** listens to `ArticleCreated` events, retrieves the article, and notifies the **Editor** for approval.
   - **Editor** reviews and approves the article in the **Web Application**.
   - **ReviewService** sends an `ArticleApproved` event, which **PostService** listens to for publishing the article.

2. **Employee Interaction and Comments**:
   - **Employee** views published articles via the **Web Application** by querying **PostService**.
   - Upon article publication (`ArticlePublished` event), **CommentService** allows **Employees** to post comments.
   - **Employee** submits a comment, which the **Web Application** sends to **CommentService**.
   - **CommentService** emits a `CommentAdded` event for potential analytics or notifications.

---

## Sequence of Events

- **ArticleCreated**: Emitted by **PostService** when an article is drafted. **ReviewService** listens to initiate review.
- **ArticleApproved/Rejected**: Emitted by **ReviewService** after review. **PostService** listens to publish or archive the article.
- **ArticlePublished**: Emitted by **PostService** on publication. **CommentService** listens to enable commenting.
- **CommentAdded**: Emitted by **CommentService** when an employee adds a comment, allowing **PostService** to update the comment count.

[View the diagram](./FullStack-Java-Architectuur.pdf)
![Internal News Management System Architecture]([https://docs.microsoft.com/en-us/dotnet/architecture/cloud-native/media/eshoponcontainers-development-architecture.png](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000FF&edit=_blank&layers=1&nav=1&title=FullStack-Java-Architectuur.drawio#R%3Cmxfile%3E%3Cdiagram%20name%3D%22Pagina-1%22%20id%3D%22seiyGnuUlcxvpURCAEHz%22%3E7V1bk6JIFv41FdH7oMHd8tGyqns2oqu3uu2N3tmXjRRSZRpJGlDL%2BfWbVyABERQtysaJmSkOSZKXc75z8ssLd%2Fp0%2FfopBMHqGTnQu9MU5%2FVOf7zT8M9S8f%2BIZM8k9%2Bo9EyxD12EiNRXM3L8hFypcunEdGEkJY4S82A1koY18H9qxJANhiHZysgXy5LcGYAkLgpkNvKL0h%2BvEK14LbZTK%2F4DuciXerFpjdmcNRGJek2gFHLTLiPSnO30aIhSzv9avU%2BiRxhPtwp77eOBuUrAQ%2BnGdB77%2BGuxt%2B%2BHHWI2eDHf2GC%2Bi7YB3xhZ4G15hXth4L1pgGaJNUHwZf%2F8WhjF8LesKMBc5pLXFagLRGsbhHqfjTw1UzWAPchXRdZ7RLm1wzeCtuMo2tsmFgHfyMsk8bQf8B2%2BKBs1iFZrlh%2BuT3tOU726M65VvpCgO0c9EQ9Q7%2FSHpbgVfOCBaQYdfAM9d%2BvhvG7clDLFgFa%2B99KmAZLl%2BXRJ7Gq6R%2FXMTDHGTxsD1YRgNd6wgaTYeXOD2eCAd4WK9nXBxjAKSXwBs119%2Bpmke74mElnSKPBRqtOy6Qn%2FyLZ3dsg3yD761wAWgN5jcoj8sX%2BNSfYevtENYKm7C6ghfe2AOvQdg%2FyQ65DsiAx%2F5OMnDbuXGcIYLSNLvcHWxrKhnlWqbV76ikl1Ch9D8LwI1uJweLvwKQwruGNkEjC9gLTQHzrFkEgQe7p7YRb5I8n0f8CRT0b3JLWivfNxaS24SE3%2B58UBy%2BxFGdugGNDN6%2FyVEW4qTGB1XWDuVTUQyU1yiYQvSwgT6iGSOcHNoypPjxigk6YHvkOt14KE9hNGQvYP2nAAEy4t550pKb%2F3aIHFjENFun%2BAEqhW8pjfxX0v%2Bf5rLPBWYvJU0U9zE7TzPP4Bl7M2y2HG3ichkmdH2xJnRUjBJ2oxYbj5m8sw%2BL4oWVr2kaSuoVa3Ac7ETi0oT6k8W%2BafsWVPueandytooX03tGOyNMjbEYTKDcdSGExQrs94MkGWhQD0KBQvX8zLwoukT7XFchJ0F%2FZVBKAht8bYcknGMexo9TghEYdsGRPl5MUOIu4x7KvJggLDJUFs2iV4pQ9LIU4X%2BS%2FRnSoVlslFRqJIrkYMsLJONzLIs1ZJ352VaibA0y5J3K7lCmo%2BXgGHh2pWanl1rjsr4kgNzA0evjwquHDo4AOSXKIxXaIl84D2l0gfZENI0nxHxuVSv%2FoJxvOcaCTYxko0Dvrrxf8jjuC%2FY1Z%2BZO4%2BvPGd6sc9cvMDQxc1ANP6RqTkI4wmJcokteCCKXFuIP7pe8jrfEYm4vWEJvy9FJyq%2FeAExfolPIwZNuS9VCO7pIrQJbVjRwiLeJ81aqSIh9LB73Mpxd1n%2F80dfiKlmwkhDKBLXtbF%2BL%2BeBW2UJY%2F5YNlDO56SKQctejEVMQ86K1bqQFW5lsM8k42hSUWZ9XP6mVMVZnqnCJy12enRr6IXw9sknIEjiAQfaON73sD5geCBV2fv2KkQ%2B2kTUY63XGz8JZCywJrjvz6Og3G3OYbyD0CeKAsOta%2FMQBVvQkoQhcIv1aTAHEXmdsoZRBJY4XB1WO%2BqM6MMkU75%2FVDm%2BnIV%2FZgFO1ioLTiUfUq9dx2EAUOk1GgCogJ8WRlEYwxVTUqYBz%2BlMw1J1KdeR%2FDxaLCIY3%2BVhuQUtFeb7RtCcAeYUpntoPg2aTwLm1hRp3B0fr%2FSKdIYiFV38qCVNajakfyJuC8seNtEJg%2FlvYD534%2BdfB0fzwHY9NwYxdZayA57KHjrvj5XU365dO0TC6d7IqD4fbvRD%2FMZDfGaqB8f4gn%2B0956L8Y%2FwgA8RH1ibtLlCbCdMUzEskEHcMSZgzpD081wIZGg9nRgQA36tCVFQmxkoMAHtj%2B%2FbHrXnw9KDgF5jwH6InB%2BPjasN4RuCMqU0i3iMHWqUkq4FsH3%2FyPhOQM%2Bmv7cBvXEl6FXQltLETRnQ5QBKudc%2FjsxSnLF01ZxWQFV%2B6sc2hgFVXa0Mx05Fq04QjxdDKxwhSmhlmEWwUsrA6v7KYFVvOmhmowA%2BELcIeFFwuuyjNPk%2FiUrgoQm%2B%2BwXuSMz4DHywhGsWpM72UQzX14O5DMSU5Ip7Mh5wbSbZ0tnLckwogmUJbjWF0NOLxFFX6rkq8D2KSsz31JhuKQOmI0GXNNxLJ0c0JQdZPMwqoFUywZtDK%2FY7GrYdmZueozhG6yQXFGJbyZeITVx%2Fp6NtJRXc8Rme4hDWKKJiiPAoKsvTZcbWJI4F%2FtKDmQH3g484L5iGpi%2FAcdh72dy9h3YTsa6ESGSejo3iAzKpyi7wazZhhIe83yCPo2kSXEb%2BRILeMKTDSpEvmEfI28Rwks5sleF8Pz91qq%2BwdJnYVIu%2BQtWsMmehGleanRJk61suz9FGsks1rVGhnXS1pJn00aVXVkzRmvu4SeCeQMTMghBb9pyswDo0OpgQeycuFYoFEmT%2BApFaOYJ%2FoUarKZR%2FCTZzz6XQS5afYdDzboZ86ZdUnDT0yKLQMSffr6n4rXxWNebX9mS6PO2ndZWgSeHaIVEZiOAJmP28n339fBCuZzEKYbqqLcTVceEWRjJSs5VwENirFKVvBKR7hvx8xK5eBXeMIe%2FZ8HfDhl8If5Vx1wH4TMLpmUwtztjUYs8rdY9XMnteqeeVel6pEzH6JViS01Y6WwXqqDPrmHFrh%2FtMRuTyz%2By9NCt6tc9e5TM7aaVTZTcfX%2F8kdibS5UdHY8s2F0qdtc3NECxhyi8mIygyRitoTIdWzloHTLAxwakMFdWUOU7Osp66Wu3ya2O1TuzbNOXF6x1ihl9QdFFa%2BA%2FsiNlyeU4fkGQh5NHblHYECsnWYraIPstGAO9GuIaeED6JXshaVU8I98Hm0Sik%2Fi67d0YIc5S%2BAhucgLQTgkWcEsQ3PF3XM8HnQ7VVCdU9E3zjTPDZwNtZJpghb08D3zQNXI1ePQ3c08A9DXytyLw7NLBZIIp6GrheNx%2BngXkfHqeBOXnZFRpYKbCJ74YGNlujM5WhYliaFMCdeYDCFXjgcaHnCp11cR7YHMu7sjvEA3%2BDWxfuzmSC8a2HKjKY7bZJz15L2YZQvJ6xDSAIQrSlG3XwHzaMboVr6JngUwL06k2JPRHch5sHwL4%2BHzGS%2BYiuEsEJTL%2FFwmAG0v264B6uj7DB1cvqejb4xtngs9G3s2ywgN%2BeD75pPlhvEG%2F2fHDPB%2FcB%2BuUC9O7wwUaBMOr54HrdfJQP5umO08GcxOwKHawVSMV3QwcbrbGaWTq4uwSwOFC9i%2BZ72SNHx23bTPmRowP5kBBdTDhc6exao7jQewrIQRO7EAdkKU3BjgY9ehw3Y6BhwoPw9W%2FVMW9GFJGTL7JHYeCeq%2F3wJhjEaIARBB4837u7wCKmyNoAFnU8zg0Nz4OZtz6oWy10XGcw6O1DiLqANqobLCidChbM4rcEnsFPig10zk3BZumJQ3O6a97tzYZi8zbEvqp2zDt3nP8VDLo4idyiQWu9RZcOE7pi0MXo%2Fz0atKhFKwOB0WW%2BrCG%2Bi3AFi9YvadGj3qLL9wN3xaTFqPh9m7SINFrx0aZs0Z1f6WUUP0naf7Pp0nrYXlRoDBVFT37aKLdTZGyZQyXzMw9r3nnUXvFA0V6L3o0WaZY1HI%2Bt5HcvQ5hiGmcqUcMPLnAeSNzpP7nQtdUyb%2FjJBaP%2F5EKnJjdrLn1pfIy2OIfl%2Bh9cqBn7%2Fq4TJMbvMUFiFo8wYhMkIQQkskjnR7oQClSqaDtcxVgzOzSW2X18%2BWT9%2BN%2BvrRNtPoHvf6Mv%2Fx0NipRxsXfSzxmm3zzMdJNswzUMSfqMYrIMKf2GIiMUnMwXFQ%2Ba3lGLyoCfWYJ9Qnau4ani4wTc9Kz8ZwkOfKW4mJN2fySn9oy4VCHMEoVoGCMpOEai4Uou1PkGbeiKhd6%2FNjCKBdFRPoJpuJivbjFaq4%2Fru7EL6NQv220k9hg1qk7F6KoLldyh8OfCQ%2BnOKUK33VQNWd9hAIrJ4PqWavZh6wJ8%2F18B9D9C4jLpwoR3XKF898wytMOwYdWuH4NUL5wt%2BrhKh93KWYuGvPZBTIKcOTuqyw9cLngp8rB98HJC8JIPOe6VU4OXfBhUyOnCwUvZUZwnEDxl0PPviAYuGSw9MXI5g3gqK1cE2X5m8t9GhYkCOjar%2F2ZlnkDXgFNc5D6LgrzSwom9fRVFY8Wo7YWuX4d0C7nrL1C4riTdD1ToEh3PdkjyVYN0a3xboUvLBf1wjpeu5bvJNp7LuW1COkXpPgyZ2izZ9XfQnzcm9ArIPLJ4HtKH8Upcw7g5pVcPYWscctG6y%2B26A9VG%2BV460X%2Bq5pGMLuw%2BxXrGS%2FjPrxuIXUG6tTuB1Tf3oA6Mges1Hfpdw%2FXsVnTS1oeQ2Ms79qH0K41Yq1yH0iWNKnKN8okPkg2PlKXuQPiQql3NzbbiZX9r35sfG49KTuxQ9RKnctpuwZCcapQBczIH%2BowcQkc8%2FR8%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E))

:heavy_check_mark:_(COMMENT) Add a description of the architecture of your application and create a diagram like the one below. Link to the diagram in this document.
