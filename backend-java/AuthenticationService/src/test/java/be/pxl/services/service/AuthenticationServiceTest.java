package be.pxl.services.service;

import be.pxl.services.domain.User;
import be.pxl.services.domain.dto.AuthResponse;
import be.pxl.services.domain.dto.LoginRequest;
import be.pxl.services.domain.dto.RegisterRequest;
import be.pxl.services.repository.UserRepository;
import be.pxl.services.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.mockito.ArgumentMatchers.any;

import java.util.Optional;

import static junit.framework.TestCase.*;
import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceTest {

    @InjectMocks
    private AuthenticationService authenticationService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;

    @Test
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest request = new LoginRequest("validUser", "validPassword");
        User user = new User(null, "validUser", "encodedPassword", "USER");
        when(userRepository.findByUsername("validUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("validPassword", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("validUser", "USER")).thenReturn("validToken");

        AuthResponse response = authenticationService.login(request);

        assertEquals("validToken", response.getToken());
        assertEquals("validUser", response.getUsername());
        assertEquals("USER", response.getRole());
    }

    @Test
    void login_invalidUsername_throwsException() {
        LoginRequest request = new LoginRequest("invalidUser", "password");
        when(userRepository.findByUsername("invalidUser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authenticationService.login(request));
    }

    @Test
    void login_invalidPassword_throwsException() {
        LoginRequest request = new LoginRequest("validUser", "invalidPassword");
        User user = new User(null, "validUser", "encodedPassword", "USER");
        when(userRepository.findByUsername("validUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("invalidPassword", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authenticationService.login(request));
    }

    @Test
    void register_validRequest_returnsUser() {
        RegisterRequest request = new RegisterRequest("newUser", "newPassword", "USER");
        when(userRepository.findByUsername("newUser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
        User user = new User(null, "newUser", "encodedPassword", "USER");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User savedUser = authenticationService.register(request);

        assertEquals("newUser", savedUser.getUsername());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals("USER", savedUser.getRole());
    }

    @Test
    void register_existingUsername_throwsException() {
        RegisterRequest request = new RegisterRequest("existingUser", "password", "USER");
        User user = new User(null, "existingUser", "encodedPassword", "USER");
        when(userRepository.findByUsername("existingUser")).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> authenticationService.register(request));
    }
}
