package be.pxl.postservice.service;

import be.pxl.postservice.domain.Post;
import be.pxl.postservice.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getDrafts() {
        return postRepository.findAll().stream()
                .filter(post -> !post.getIsPublished())
                .toList();
    }

    public List<Post> getPosts() {
        return postRepository.findAll().stream()
                .filter(Post::getIsPublished)
                .toList();
    }

    public Post updatePost(Long id, Post updatedPost) {
        try {
            Post post = postRepository.getById(id);
            post.setTitle(updatedPost.getTitle());
            post.setContent(updatedPost.getContent());
            post.setAuthor(updatedPost.getAuthor());
            post.setDate(updatedPost.getDate());
            post.setIsPublished(updatedPost.getIsPublished());
            post.setStatus(updatedPost.getStatus());
            return postRepository.save(post);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating post", e);
        }
    }

    public Post publishPost(Long id) {
        return postRepository.findById(id)
                .map(post -> {
                    if ("Approved".equals(post.getStatus())) {
                        post.setIsPublished(true);
                        post.setDate(LocalDate.now());
                        return postRepository.save(post);
                    } else {
                        throw new RuntimeException("Only approved posts can be published");
                    }
                })
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public List<Post> filterPosts(String keyword) {
        return postRepository.findAll().stream()
                .filter(post -> post.getTitle().contains(keyword))
                .toList();
    }

    public Post getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }
}