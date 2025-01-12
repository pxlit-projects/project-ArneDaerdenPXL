package be.pxl.services.controller;

import be.pxl.services.domain.Comment;
import be.pxl.services.exception.CommentNotFoundException;
import be.pxl.services.service.CommentService;
import be.pxl.services.repository.CommentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    @Mock
    private CommentService commentService;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentController commentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Comment comment;
    private Comment comment1;
    private Comment comment2;
    private List<Comment> commentList;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders
                .standaloneSetup(commentController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        comment = new Comment(1L, 1L, "testUser", "This is a test comment", LocalDateTime.now());
        comment1 = new Comment(2L, 2L, "testUser", "First comment", LocalDateTime.now());
        comment2 = new Comment(3L, 3L, "testUser", "Second comment", LocalDateTime.now());

        commentList = List.of(comment1, comment2);
    }

    @Test
    void getComments_success() throws Exception {
        when(commentService.getCommentsByPostId(1L)).thenReturn(commentList);

        mockMvc.perform(get("/api/comments/post/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[0].content").value("First comment"))
                .andExpect(jsonPath("$[1].id").value(3L))
                .andExpect(jsonPath("$[1].content").value("Second comment"));

        verify(commentService, times(1)).getCommentsByPostId(1L);
    }

    @Test
    void getComments_noComments() throws Exception {
        when(commentService.getCommentsByPostId(999L)).thenReturn(List.of());

        mockMvc.perform(get("/api/comments/post/999"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(commentService, times(1)).getCommentsByPostId(999L);
    }

    @Test
    void addComment_success() throws Exception {
        when(commentService.addComment(any(Comment.class))).thenReturn(comment);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.content").value("This is a test comment"));

        verify(commentService, times(1)).addComment(any(Comment.class));
    }

    @Test
    void updateComment_success() throws Exception {
        doNothing().when(commentService).updateComment(eq(1L), any(Comment.class));

        mockMvc.perform(patch("/api/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isNoContent());

        verify(commentService, times(1)).updateComment(eq(1L), any(Comment.class));
    }

    @Test
    void updateComment_notFound() throws Exception {
        doThrow(new CommentNotFoundException("Comment not found"))
                .when(commentService).updateComment(eq(999L), any(Comment.class));

        mockMvc.perform(patch("/api/comments/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isNotFound());

        verify(commentService, times(1)).updateComment(eq(999L), any(Comment.class));
    }

    @Test
    void deleteComment_success() throws Exception {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        doNothing().when(commentService).deleteComment(1L);

        mockMvc.perform(delete("/api/comments/1"))
                .andExpect(status().isNoContent());

        verify(commentService, times(1)).deleteComment(1L);
    }

    @Test
    void deleteComment_notFound() throws Exception {
        when(commentRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/comments/999"))
                .andExpect(status().isNotFound());
    }
}