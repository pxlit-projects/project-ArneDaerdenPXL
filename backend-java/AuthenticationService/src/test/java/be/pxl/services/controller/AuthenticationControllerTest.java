package be.pxl.services.controller;

import be.pxl.services.domain.User;
import be.pxl.services.domain.dto.AuthResponse;
import be.pxl.services.domain.dto.LoginRequest;
import be.pxl.services.domain.dto.RegisterRequest;
import be.pxl.services.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private AuthenticationController authenticationController;

    private MockMvc mockMvc;

    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;
    private AuthResponse authResponse;
    private User user;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // Initialize the test objects
        loginRequest = new LoginRequest("testUser", "password");
        registerRequest = new RegisterRequest("newUser", "password", "USER");

        authResponse = new AuthResponse("mockToken", "testUser", "USER");
        user = new User();
        user.setUsername("newUser");
        user.setPassword("encodedPassword");
        user.setRole("USER");
    }

    // Test for the login endpoint
    @Test
    void login_success() throws Exception {
        // Arrange: mock the service layer
        when(authenticationService.login(loginRequest)).thenReturn(authResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockToken"))
                .andExpect(jsonPath("$.username").value("testUser"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(authenticationService, times(1)).login(loginRequest);
    }

    @Test
    void login_invalidCredentials() throws Exception {
        // Arrange: mock the service to throw an exception
        when(authenticationService.login(loginRequest)).thenThrow(new RuntimeException("Invalid credentials"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));

        verify(authenticationService, times(1)).login(loginRequest);
    }

    // Test for the register endpoint
    @Test
    void register_success() throws Exception {
        // Arrange: mock the service layer
        when(authenticationService.register(registerRequest)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newUser"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(authenticationService, times(1)).register(registerRequest);
    }

    @Test
    void register_usernameAlreadyExists() throws Exception {
        // Arrange: mock the service to throw an exception
        when(authenticationService.register(registerRequest)).thenThrow(new RuntimeException("Username already exists"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username already exists"));

        verify(authenticationService, times(1)).register(registerRequest);
    }
}