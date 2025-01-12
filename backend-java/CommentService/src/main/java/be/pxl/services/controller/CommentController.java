package be.pxl.services.controller;

import be.pxl.services.domain.Comment;
import be.pxl.services.exception.CommentNotFoundException;
import be.pxl.services.repository.CommentRepository;
import be.pxl.services.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    private final CommentService commentService;
    private final CommentRepository commentRepository;

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        log.info("Request to fetch comments for postId: {}", postId);
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        log.info("Successfully fetched {} comments for postId: {}", comments.size(), postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        log.info("Request to add a new comment: {}", comment);
        Comment createdComment = commentService.addComment(comment);
        log.info("Successfully added comment with ID: {}", createdComment.getId());
        return ResponseEntity.ok(createdComment);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateComment(@PathVariable Long id, @RequestBody Comment updatedComment) {
        log.info("Request to update comment with ID: {}", id);
        try {
            commentService.updateComment(id, updatedComment);
            log.info("Successfully updated comment with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (CommentNotFoundException ex) {
            log.error("Comment with ID: {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        log.info("Request to delete comment with ID: {}", id);
        Optional<Comment> comment = commentRepository.findById(id);
        if (comment.isEmpty()) {
            log.error("Comment with ID: {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        commentService.deleteComment(id);
        log.info("Successfully deleted comment with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}