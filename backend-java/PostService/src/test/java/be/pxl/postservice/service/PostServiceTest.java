package be.pxl.postservice.service;

import be.pxl.postservice.domain.Post;
import be.pxl.postservice.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostService postService;

    private Post post;

    @BeforeEach
    void setUp() {
        // Initialize a sample Post object
        post = new Post();
        post.setId(1L);
        post.setTitle("Test Post");
        post.setContent("This is a test post.");
        post.setAuthor("Author");
        post.setDate(LocalDate.now());
        post.setIsPublished(false);
        post.setStatus("Declined");
    }

    @Test
    void testCreatePost() {
        // Arrange
        when(postRepository.save(post)).thenReturn(post);

        // Act
        Post createdPost = postService.createPost(post);

        // Assert
        assertNotNull(createdPost);
        assertEquals("Declined", createdPost.getStatus());
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void testGetDrafts() {
        // Arrange
        when(postRepository.findAll()).thenReturn(List.of(post));

        // Act
        List<Post> drafts = postService.getDrafts();

        // Assert
        assertNotNull(drafts);
        assertEquals(1, drafts.size());
        assertFalse(drafts.get(0).getIsPublished());
        verify(postRepository, times(1)).findAll();
    }

    @Test
    void testGetPosts() {
        // Arrange
        post.setIsPublished(true);
        when(postRepository.findAll()).thenReturn(List.of(post));

        // Act
        List<Post> posts = postService.getPosts();

        // Assert
        assertNotNull(posts);
        assertEquals(1, posts.size());
        assertTrue(posts.get(0).getIsPublished());
        verify(postRepository, times(1)).findAll();
    }

    @Test
    void testUpdatePost() {
        // Arrange
        Post updatedPost = new Post();
        updatedPost.setTitle("Updated Title");
        updatedPost.setContent("Updated Content");
        updatedPost.setAuthor("Updated Author");
        updatedPost.setDate(LocalDate.now());
        updatedPost.setIsPublished(true);
        updatedPost.setStatus("Approved");

        when(postRepository.getById(1L)).thenReturn(post);
        when(postRepository.save(post)).thenReturn(post);

        // Act
        Post result = postService.updatePost(1L, updatedPost);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
        assertEquals("Updated Content", result.getContent());
        verify(postRepository, times(1)).getById(1L);
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void testUpdatePostNotFound() {
        // Arrange
        Post updatedPost = new Post();
        updatedPost.setTitle("Updated Title");

        when(postRepository.getById(1L)).thenThrow(new RuntimeException("Post not found"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.updatePost(1L, updatedPost);
        });
        assertEquals("Error updating post", exception.getMessage());
    }

    @Test
    void testPublishPost() {
        // Arrange
        post.setStatus("Approved");
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(post)).thenReturn(post);

        // Act
        Post publishedPost = postService.publishPost(1L);

        // Assert
        assertNotNull(publishedPost);
        assertTrue(publishedPost.getIsPublished());
        assertEquals(LocalDate.now(), publishedPost.getDate());
        verify(postRepository, times(1)).findById(1L);
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void testPublishPostNotFound() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.publishPost(1L);
        });
        assertEquals("Post not found", exception.getMessage());
    }

    @Test
    void testPublishPostNotApproved() {
        // Arrange
        post.setStatus("Declined");
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.publishPost(1L);
        });
        assertEquals("Only approved posts can be published", exception.getMessage());
    }

    @Test
    void testFilterPosts() {
        // Arrange
        post.setTitle("Test Keyword Post");
        when(postRepository.findAll()).thenReturn(List.of(post));

        // Act
        List<Post> filteredPosts = postService.filterPosts("Keyword");

        // Assert
        assertNotNull(filteredPosts);
        assertEquals(1, filteredPosts.size());
        assertTrue(filteredPosts.get(0).getTitle().contains("Keyword"));
        verify(postRepository, times(1)).findAll();
    }

    @Test
    void testGetPost() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        // Act
        Post foundPost = postService.getPost(1L);

        // Assert
        assertNotNull(foundPost);
        assertEquals(1L, foundPost.getId());
        verify(postRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPostNotFound() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.getPost(1L);
        });
        assertEquals("Post not found", exception.getMessage());
    }
}