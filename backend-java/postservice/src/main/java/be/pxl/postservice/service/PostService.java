package be.pxl.postservice.service;

import be.pxl.postservice.model.Post;
import be.pxl.postservice.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public Post updatePost(Long id, Post updatedPost) {
        return postRepository.findById(id)
                .map(post -> {
                    post.setTitle(updatedPost.getTitle());
                    post.setContent(updatedPost.getContent());
                    post.setAuthor(updatedPost.getAuthor());
                    post.setIsPublished(updatedPost.getIsPublished());
                    return postRepository.save(post);
                })
                .orElseThrow(() -> new IllegalArgumentException("Post with id " + id + " not found"));
    }
}