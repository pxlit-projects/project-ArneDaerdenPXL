package be.pxl.reviewservice.controller;

import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {
    private final ReviewService reviewService;

    @PatchMapping("/approve/{id}/{reviewer}")
    public ResponseEntity<Void> approvePost(@PathVariable Long id, @PathVariable String reviewer, @RequestBody String comments) {
        log.info("Approving post with ID: {} by reviewer: {}", id, reviewer);
        reviewService.approvePost(id, comments, reviewer);
        log.info("Post with ID: {} approved successfully by reviewer: {}", id, reviewer);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/decline/{id}/{reviewer}")
    public ResponseEntity<Void> declinePost(@PathVariable Long id, @PathVariable String reviewer, @RequestBody String comments) {
        log.info("Declining post with ID: {} by reviewer: {}", id, reviewer);
        reviewService.declinePost(id, comments, reviewer);
        log.info("Post with ID: {} declined successfully by reviewer: {}", id, reviewer);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Review> getReviewsByPostId(@PathVariable Long postId) {
        log.info("Fetching reviews for post with ID: {}", postId);
        Review reviews = reviewService.getReviewByPostId(postId);
        log.info("Found {} reviews for post with ID: {}", reviews != null ? 1 : 0, postId);
        return ResponseEntity.ok(reviews);
    }
}