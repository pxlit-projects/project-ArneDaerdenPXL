package be.pxl.services.service;

import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetCommentsByPostId() {
        Long postId = 1L;
        List<Comment> mockComments = Arrays.asList(
                new Comment(1L, postId, "author", "Test Comment 1", LocalDateTime.now()),
                new Comment(2L, postId, "author", "Test Comment 2", LocalDateTime.now())
        );

        when(commentRepository.findByPostId(postId)).thenReturn(mockComments);

        List<Comment> result = commentService.getCommentsByPostId(postId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getContent()).isEqualTo("Test Comment 1");
        verify(commentRepository).findByPostId(postId);
    }

    @Test
    void testAddComment() {
        Comment newComment = new Comment(null, 1L, "author", "New Comment", null);
        Comment savedComment = new Comment(1L, 1L, "author", "New Comment", LocalDateTime.now());

        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        Comment result = commentService.addComment(newComment);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getContent()).isEqualTo("New Comment");
        assertThat(result.getCreatedAt()).isNotNull();
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void testUpdateComment() {
        Long commentId = 1L;
        Comment existingComment = new Comment(commentId, 1L, "author", "Old Content", LocalDateTime.now());
        Comment updatedComment = new Comment(commentId, 1L, "author", "Updated Content", null);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));
        when(commentRepository.save(existingComment)).thenReturn(existingComment);

        commentService.updateComment(commentId, updatedComment);

        assertThat(existingComment.getContent()).isEqualTo("Updated Content");
        verify(commentRepository).findById(commentId);
        verify(commentRepository).save(existingComment);
    }

    @Test
    void testUpdateComment_NotFound() {
        Long commentId = 1L;
        Comment updatedComment = new Comment(commentId, 1L, "author", "Updated Content", null);

        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                commentService.updateComment(commentId, updatedComment));

        assertThat(exception.getMessage()).isEqualTo("Comment not found");
        verify(commentRepository).findById(commentId);
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void testDeleteComment() {
        Long commentId = 1L;

        doNothing().when(commentRepository).deleteById(commentId);

        commentService.deleteComment(commentId);

        verify(commentRepository).deleteById(commentId);
    }
}