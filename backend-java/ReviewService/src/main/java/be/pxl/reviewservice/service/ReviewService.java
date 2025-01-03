package be.pxl.reviewservice.service;

import be.pxl.reviewservice.client.NotificationClient;
import be.pxl.reviewservice.domain.NotificationRequest;
import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final NotificationClient notificationClient;

    public void approvePost(Long postId, String comment) {
        try {
            Review review = reviewRepository.findByPostId(postId);
            if (review == null) {
                review = new Review();
            }
            review.setPostId(postId);
            review.setStatus("Approved");
            review.setComments(comment);
            reviewRepository.save(review);

            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .message("Post Approved")
                    .sender("author")
                    .build();
            //notificationClient.sendNotification(notificationRequest);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void declinePost(Long postId, String comment) {
        try {
            Review review = reviewRepository.findByPostId(postId);
            if (review == null) {
                review = new Review();
            }
            review.setPostId(postId);
            review.setStatus("Rejected");
            review.setComments(comment);
            reviewRepository.save(review);

            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .message("Post declined")
                    .sender("author")
                    .build();
            //notificationClient.sendNotification(notificationRequest);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Review getReviewByPostId(Long postId) {
        return reviewRepository.findByPostId(postId);
    }
}
