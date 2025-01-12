package be.pxl.services.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class JwtUtilTest {

    private JwtUtil jwtUtil;

    private String secret = "EKz+9yBO7cQ/UhJOl1oxtjjGRktISYof9MBGJ3yoY4U=";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    @Test
    void generateToken_validInputs_returnsToken() {
        String username = "testUser";
        String role = "USER";

        String token = jwtUtil.generateToken(username, role);

        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateToken_nullUsername_returnsNull() {
        String role = "USER";

        String token = jwtUtil.generateToken(null, role);

        assertNull(token);
    }

    @Test
    void generateToken_nullRole_returnsNull() {
        String username = "testUser";

        String token = jwtUtil.generateToken(username, null);

        assertNull(token);
    }

    @Test
    void getUsernameFromToken_validToken_returnsUsername() {
        String token = Jwts.builder()
                .setSubject("testUser")
                .claim("role", "USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();

        String username = jwtUtil.getUsernameFromToken(token);

        assertEquals("testUser", username);
    }

    @Test
    void getUsernameFromToken_invalidToken_returnsNull() {
        String token = "invalidToken";

        String username = jwtUtil.getUsernameFromToken(token);

        assertNull(username);
    }

    @Test
    void getRoleFromToken_validToken_returnsRole() {
        String token = Jwts.builder()
                .setSubject("testUser")
                .claim("role", "USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();

        String role = jwtUtil.getRoleFromToken(token);

        assertEquals("USER", role);
    }

    @Test
    void getRoleFromToken_invalidToken_returnsNull() {
        String token = "invalidToken";

        String role = jwtUtil.getRoleFromToken(token);

        assertNull(role);
    }

    @Test
    void generateToken_exceptionHandling_returnsNull() {
        ReflectionTestUtils.setField(jwtUtil, "secret", null);

        String token = jwtUtil.generateToken("testUser", "USER");

        assertNull(token);
    }

    @Test
    void getClaimFromToken_exceptionHandling_returnsNull() {
        String token = "invalidToken";

        String username = jwtUtil.getUsernameFromToken(token);

        assertNull(username);
    }
}