package be.pxl.postservice.service;

import be.pxl.postservice.domain.Post;
import be.pxl.postservice.repository.PostRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        log.info("Creating post with title: {} and initial status: {}", post.getTitle(), post.getStatus());
        post.setStatus("Declined");
        Post savedPost = postRepository.save(post);
        log.info("Post created successfully with ID: {}", savedPost.getId());
        return savedPost;
    }

    public List<Post> getDrafts() {
        log.info("Fetching drafts...");
        List<Post> drafts = postRepository.findAll().stream()
                .filter(post -> !post.getIsPublished())
                .toList();
        log.info("Found {} drafts", drafts.size());
        return drafts;
    }

    public List<Post> getPosts() {
        log.info("Fetching published posts...");
        List<Post> posts = postRepository.findAll().stream()
                .filter(Post::getIsPublished)
                .toList();
        log.info("Found {} published posts", posts.size());
        return posts;
    }

    public Post updatePost(Long id, Post updatedPost) {
        log.info("Updating post with ID: {}", id);
        try {
            Post post = postRepository.getById(id);
            log.debug("Existing post details: title={}, content={}, author={}", post.getTitle(), post.getContent(), post.getAuthor());

            post.setTitle(updatedPost.getTitle());
            post.setContent(updatedPost.getContent());
            post.setAuthor(updatedPost.getAuthor());
            post.setDate(updatedPost.getDate());
            post.setIsPublished(updatedPost.getIsPublished());
            post.setStatus(updatedPost.getStatus());

            Post savedPost = postRepository.save(post);
            log.info("Post with ID: {} updated successfully", id);
            return savedPost;
        } catch (Exception e) {
            log.error("Error updating post with ID: {}. Error: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error updating post", e);
        }
    }

    public Post publishPost(Long id) {
        log.info("Attempting to publish post with ID: {}", id);
        return postRepository.findById(id)
                .map(post -> {
                    if ("Approved".equals(post.getStatus())) {
                        log.info("Post with ID: {} is approved. Publishing...", id);
                        post.setIsPublished(true);
                        post.setDate(LocalDate.now());
                        Post publishedPost = postRepository.save(post);
                        log.info("Post with ID: {} published successfully", id);
                        return publishedPost;
                    } else {
                        log.warn("Post with ID: {} cannot be published because it is not approved", id);
                        throw new RuntimeException("Only approved posts can be published");
                    }
                })
                .orElseThrow(() -> {
                    log.error("Post with ID: {} not found", id);
                    return new RuntimeException("Post not found");
                });
    }

    public List<Post> filterPosts(String keyword) {
        log.info("Filtering posts with keyword: {}", keyword);
        List<Post> filteredPosts = postRepository.findAll().stream()
                .filter(post -> post.getTitle().contains(keyword))
                .toList();
        log.info("Found {} posts with keyword: {}", filteredPosts.size(), keyword);
        return filteredPosts;
    }

    public Post getPost(Long id) {
        log.info("Fetching post with ID: {}", id);
        return postRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Post with ID: {} not found", id);
                    return new RuntimeException("Post not found");
                });
    }
}