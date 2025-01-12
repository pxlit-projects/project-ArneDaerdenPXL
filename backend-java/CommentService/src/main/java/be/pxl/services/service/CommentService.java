package be.pxl.services.service;

import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final CommentRepository commentRepository;

    public List<Comment> getCommentsByPostId(Long postId) {
        log.info("Fetching comments for postId: {}", postId);
        List<Comment> comments = commentRepository.findByPostId(postId);
        log.info("Retrieved {} comments for postId: {}", comments.size(), postId);
        return comments;
    }

    public Comment addComment(Comment comment) {
        log.info("Adding new comment: {}", comment);
        comment.setCreatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        log.info("Successfully added comment with ID: {}", savedComment.getId());
        return savedComment;
    }

    public void updateComment(Long id, Comment updatedComment) {
        log.info("Updating comment with ID: {}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Comment with ID: {} not found", id);
                    return new RuntimeException("Comment not found");
                });
        comment.setContent(updatedComment.getContent());
        commentRepository.save(comment);
        log.info("Successfully updated comment with ID: {}", id);
    }

    public void deleteComment(Long commentId) {
        log.info("Deleting comment with ID: {}", commentId);
        commentRepository.deleteById(commentId);
        log.info("Successfully deleted comment with ID: {}", commentId);
    }
}