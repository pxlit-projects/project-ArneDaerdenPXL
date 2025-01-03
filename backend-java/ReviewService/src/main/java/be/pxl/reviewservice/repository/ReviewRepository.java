package be.pxl.reviewservice.repository;

import be.pxl.reviewservice.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Review findByPostId(Long postId);
}