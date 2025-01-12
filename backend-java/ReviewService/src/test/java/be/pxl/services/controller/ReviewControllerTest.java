package be.pxl.services.controller;

import be.pxl.reviewservice.controller.ReviewController;
import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ReviewControllerTest {

    private ReviewService reviewService;
    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        reviewService = Mockito.mock(ReviewService.class);
        reviewController = new ReviewController(reviewService);
    }

    @Test
    void approvePost_shouldCallServiceAndReturnOk() {
        // Arrange
        Long postId = 1L;
        String reviewer = "john.doe";
        String comments = "Approved";

        doNothing().when(reviewService).approvePost(postId, comments, reviewer);

        // Act
        ResponseEntity<Void> response = reviewController.approvePost(postId, reviewer, comments);

        // Assert
        assertEquals(ResponseEntity.ok().build(), response);
        verify(reviewService, times(1)).approvePost(postId, comments, reviewer);
    }

    @Test
    void declinePost_shouldCallServiceAndReturnOk() {
        // Arrange
        Long postId = 1L;
        String reviewer = "john.doe";
        String comments = "Declined";

        doNothing().when(reviewService).declinePost(postId, comments, reviewer);

        // Act
        ResponseEntity<Void> response = reviewController.declinePost(postId, reviewer, comments);

        // Assert
        assertEquals(ResponseEntity.ok().build(), response);
        verify(reviewService, times(1)).declinePost(postId, comments, reviewer);
    }

    @Test
    void getReviewsByPostId_shouldReturnReview() {
        // Arrange
        Long postId = 1L;
        Review review = new Review(); // Assume Review has a no-args constructor
        when(reviewService.getReviewByPostId(postId)).thenReturn(review);

        // Act
        ResponseEntity<Review> response = reviewController.getReviewsByPostId(postId);

        // Assert
        assertEquals(ResponseEntity.ok(review), response);
        verify(reviewService, times(1)).getReviewByPostId(postId);
    }

    @Test
    void getReviewsByPostId_shouldReturnEmptyResponseWhenNoReview() {
        // Arrange
        Long postId = 1L;
        when(reviewService.getReviewByPostId(postId)).thenReturn(null);

        // Act
        ResponseEntity<Review> response = reviewController.getReviewsByPostId(postId);

        // Assert
        assertEquals(ResponseEntity.ok(null), response);
        verify(reviewService, times(1)).getReviewByPostId(postId);
    }
}