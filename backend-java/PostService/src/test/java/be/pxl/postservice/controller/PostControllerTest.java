package be.pxl.postservice.controller;

import be.pxl.postservice.domain.Post;
import be.pxl.postservice.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class PostControllerTest {

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private MockMvc mockMvc;

    private Post post;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Initialize the mock Post object
        post = new Post();
        post.setId(1L);
        post.setTitle("Test Post");
        post.setContent("This is a test post.");
        post.setAuthor("Author");
        post.setDate(LocalDate.now());
        post.setIsPublished(true);
        post.setStatus("Declined");

        // Setup MockMvc with the controller
        mockMvc = MockMvcBuilders.standaloneSetup(postController).build();
    }

    @Test
    void testCreatePost() throws Exception {
        // Arrange: Update the mock post to set isPublished to true
        post.setIsPublished(true);
        when(postService.createPost(any(Post.class))).thenReturn(post);

        // Act & Assert: Perform POST request and check response
        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(post)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Post"))
                .andExpect(jsonPath("$.content").value("This is a test post."))
                .andExpect(jsonPath("$.isPublished").value(false));

        verify(postService, times(1)).createPost(any(Post.class));
    }

    @Test
    void testGetDrafts() throws Exception {
        // Arrange: Mock the service call
        when(postService.getDrafts()).thenReturn(List.of(post));

        // Act & Assert: Perform GET request and check response
        mockMvc.perform(get("/api/posts/drafts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Post"))
                .andExpect(jsonPath("$[0].isPublished").value(false));

        verify(postService, times(1)).getDrafts();
    }

    @Test
    void testGetPosts() throws Exception {
        // Arrange: Mock the service call
        post.setIsPublished(true);
        when(postService.getPosts()).thenReturn(List.of(post));

        // Act & Assert: Perform GET request and check response
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Post"))
                .andExpect(jsonPath("$[0].isPublished").value(true));

        verify(postService, times(1)).getPosts();
    }

    @Test
    void testGetPost() throws Exception {
        // Arrange: Mock the service call
        when(postService.getPost(1L)).thenReturn(post);

        // Act & Assert: Perform GET request and check response
        mockMvc.perform(get("/api/posts/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Post"))
                .andExpect(jsonPath("$.content").value("This is a test post."));

        verify(postService, times(1)).getPost(1L);
    }

    @Test
    void testUpdatePost() throws Exception {
        // Arrange: Mock the service call
        Post updatedPost = new Post();
        updatedPost.setTitle("Updated Title");
        updatedPost.setContent("Updated Content");

        when(postService.updatePost(eq(1L), any(Post.class))).thenReturn(updatedPost);

        // Act & Assert: Perform PUT request and check response
        mockMvc.perform(put("/api/posts/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(updatedPost)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.content").value("Updated Content"));

        verify(postService, times(1)).updatePost(eq(1L), any(Post.class));
    }

    @Test
    void testPublishPost() throws Exception {
        // Arrange: Mock the service call
        post.setStatus("Approved");
        when(postService.publishPost(1L)).thenReturn(post);

        // Act & Assert: Perform PUT request to publish and check response
        mockMvc.perform(put("/api/posts/{id}/publish", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPublished").value(true));

        verify(postService, times(1)).publishPost(1L);
    }

    @Test
    void testSearchPosts() throws Exception {
        // Arrange: Mock the service call
        when(postService.filterPosts("Test")).thenReturn(List.of(post));

        // Act & Assert: Perform GET request and check response
        mockMvc.perform(get("/api/posts/search")
                        .param("keyword", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Post"));

        verify(postService, times(1)).filterPosts("Test");
    }
}