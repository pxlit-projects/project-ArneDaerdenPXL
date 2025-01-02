package be.pxl.reviewservice.controller;

import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PatchMapping("/approve/{id}")
    public ResponseEntity<Void> approvePost(@PathVariable Long id, @RequestBody String comments) {
        reviewService.approvePost(id, comments);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/decline/{id}")
    public ResponseEntity<Void> declinePost(@PathVariable Long id, @RequestBody String comments) {
        reviewService.declinePost(id, comments);
        return ResponseEntity.ok().build();
    }
}