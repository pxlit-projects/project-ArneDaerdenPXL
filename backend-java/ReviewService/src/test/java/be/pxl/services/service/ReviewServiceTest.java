package be.pxl.services.service;

import be.pxl.reviewservice.client.NotificationClient;
import be.pxl.reviewservice.domain.NotificationRequest;
import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.repository.ReviewRepository;
import be.pxl.reviewservice.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewServiceTest {

    private ReviewRepository reviewRepository;
    private NotificationClient notificationClient;
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewRepository = Mockito.mock(ReviewRepository.class);
        notificationClient = Mockito.mock(NotificationClient.class);
        reviewService = new ReviewService(reviewRepository, notificationClient);
    }

    @Test
    void approvePost_shouldSaveReviewAndSendNotification() {
        // Arrange
        Long postId = 1L;
        String comment = "Great post!";
        String reviewer = "john.doe";
        Review existingReview = new Review();
        existingReview.setPostId(postId);

        when(reviewRepository.findByPostId(postId)).thenReturn(existingReview);

        // Act
        reviewService.approvePost(postId, comment, reviewer);

        // Assert
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());
        Review savedReview = reviewCaptor.getValue();
        assertEquals("Approved", savedReview.getStatus());
        assertEquals(comment, savedReview.getComments());
        assertEquals(reviewer, savedReview.getReviewer());

        ArgumentCaptor<NotificationRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notificationClient).sendNotification(notificationCaptor.capture());
        NotificationRequest notificationRequest = notificationCaptor.getValue();
        assertEquals("Post Approved", notificationRequest.getMessage());
        assertEquals(reviewer, notificationRequest.getSender());

        verify(reviewRepository, times(1)).findByPostId(postId);
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
    }

    @Test
    void declinePost_shouldSaveReviewAndSendNotification() {
        // Arrange
        Long postId = 1L;
        String comment = "Not suitable";
        String reviewer = "jane.doe";
        Review existingReview = new Review();
        existingReview.setPostId(postId);

        when(reviewRepository.findByPostId(postId)).thenReturn(existingReview);

        // Act
        reviewService.declinePost(postId, comment, reviewer);

        // Assert
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());
        Review savedReview = reviewCaptor.getValue();
        assertEquals("Rejected", savedReview.getStatus());
        assertEquals(comment, savedReview.getComments());
        assertEquals(reviewer, savedReview.getReviewer());

        ArgumentCaptor<NotificationRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notificationClient).sendNotification(notificationCaptor.capture());
        NotificationRequest notificationRequest = notificationCaptor.getValue();
        assertEquals("Post declined", notificationRequest.getMessage());
        assertEquals(reviewer, notificationRequest.getSender());

        verify(reviewRepository, times(1)).findByPostId(postId);
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
    }

    @Test
    void getReviewByPostId_shouldReturnReview() {
        // Arrange
        Long postId = 1L;
        Review review = new Review();
        review.setPostId(postId);
        when(reviewRepository.findByPostId(postId)).thenReturn(review);

        // Act
        Review result = reviewService.getReviewByPostId(postId);

        // Assert
        assertEquals(review, result);
        verify(reviewRepository, times(1)).findByPostId(postId);
    }

    @Test
    void approvePost_shouldHandleNullReview() {
        // Arrange
        Long postId = 1L;
        String comment = "Approved";
        String reviewer = "john.doe";

        when(reviewRepository.findByPostId(postId)).thenReturn(null);

        // Act
        reviewService.approvePost(postId, comment, reviewer);

        // Assert
        verify(reviewRepository, times(1)).save(any(Review.class));
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
    }

    @Test
    void declinePost_shouldHandleNullReview() {
        // Arrange
        Long postId = 1L;
        String comment = "Declined";
        String reviewer = "jane.doe";

        when(reviewRepository.findByPostId(postId)).thenReturn(null);

        // Act
        reviewService.declinePost(postId, comment, reviewer);

        // Assert
        verify(reviewRepository, times(1)).save(any(Review.class));
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
    }
}