package be.pxl.postservice.controller;

import be.pxl.postservice.domain.Post;
import be.pxl.postservice.service.PostService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class PostController {
    @Autowired
    private PostService postService;

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        log.info("Creating new post with title: {}", post.getTitle());
        Post createdPost = postService.createPost(post);
        log.info("Created new post with ID: {}", createdPost.getId());
        return createdPost;
    }

    @GetMapping("/drafts")
    public List<Post> getDrafts() {
        log.info("Fetching all draft posts");
        List<Post> drafts = postService.getDrafts();
        log.info("Found {} draft posts", drafts.size());
        return drafts;
    }

    @GetMapping()
    public List<Post> getPosts() {
        log.info("Fetching all published posts");
        List<Post> posts = postService.getPosts();
        log.info("Found {} published posts", posts.size());
        return posts;
    }

    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        log.info("Fetching post with ID: {}", id);
        Post post = postService.getPost(id);
        log.info("Found post with ID: {}", id);
        return post;
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
        log.info("Updating post with ID: {}", id);
        Post updated = postService.updatePost(id, updatedPost);
        log.info("Updated post with ID: {}", id);
        return updated;
    }

    @PutMapping("/{id}/publish")
    public Post publishPost(@PathVariable Long id) {
        log.info("Publishing post with ID: {}", id);
        Post publishedPost = postService.publishPost(id);
        log.info("Published post with ID: {}", id);
        return publishedPost;
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam String keyword) {
        log.info("Searching for posts with keyword: {}", keyword);
        List<Post> posts = postService.filterPosts(keyword);
        log.info("Found {} posts matching the keyword: {}", posts.size(), keyword);
        return posts;
    }
}