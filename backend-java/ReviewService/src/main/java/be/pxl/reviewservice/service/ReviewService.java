package be.pxl.reviewservice.service;

import be.pxl.reviewservice.client.NotificationClient;
import be.pxl.reviewservice.domain.NotificationRequest;
import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final NotificationClient notificationClient;

    public void approvePost(Long postId, String comment, String reviewer) {
        try {
            Review review = reviewRepository.findByPostId(postId);
            if (review == null) {
                review = new Review();
            }
            review.setPostId(postId);
            review.setStatus("Approved");
            review.setComments(comment);
            review.setReviewer(reviewer);
            reviewRepository.save(review);

            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .message("Post Approved")
                    .sender(review.getReviewer())
                    .build();
            notificationClient.sendNotification(notificationRequest);
            log.info("Post with ID: {} approved by {} and notification sent.", postId, reviewer);
        } catch (Exception e) {
            log.error("Error approving post with ID: {}. Error: {}", postId, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void declinePost(Long postId, String comment, String reviewer) {
        try {
            Review review = reviewRepository.findByPostId(postId);
            if (review == null) {
                review = new Review();
            }
            review.setPostId(postId);
            review.setStatus("Rejected");
            review.setComments(comment);
            review.setReviewer(reviewer);
            reviewRepository.save(review);

            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .message("Post declined")
                    .sender(review.getReviewer())
                    .build();
            notificationClient.sendNotification(notificationRequest);
            log.info("Post with ID: {} declined by {} and notification sent.", postId, reviewer);
        } catch (Exception e) {
            log.error("Error declining post with ID: {}. Error: {}", postId, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public Review getReviewByPostId(Long postId) {
        log.info("Fetching review for post ID: {}", postId);
        return reviewRepository.findByPostId(postId);
    }
}
