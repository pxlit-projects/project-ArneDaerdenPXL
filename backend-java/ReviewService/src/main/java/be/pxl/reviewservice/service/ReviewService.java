package be.pxl.reviewservice.service;

import be.pxl.reviewservice.domain.Review;
import be.pxl.reviewservice.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public void approvePost(Long postId, String comment) {
        try {
            Review review = reviewRepository.findByPostId(postId)
                    .orElse(new Review());
            review.setPostId(postId);
            review.setStatus("Approved");
            review.setComments(comment);
            reviewRepository.save(review);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void declinePost(Long postId, String comment) {
        try {
            Review review = reviewRepository.findByPostId(postId)
                    .orElse(new Review());
            review.setPostId(postId);
            review.setStatus("Rejected");
            review.setComments(comment);
            reviewRepository.save(review);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
