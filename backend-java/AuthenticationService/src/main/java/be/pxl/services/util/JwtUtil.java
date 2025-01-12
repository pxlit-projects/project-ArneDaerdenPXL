package be.pxl.services.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(String username, String role) {
        if (username == null || role == null) {
            log.error("Username or role is null, cannot generate token");
            return null;
        }
        try {
            log.info("Generating token for user: {}", username);
            String token = Jwts.builder()
                    .setSubject(username)
                    .claim("role", role)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                    .signWith(SignatureAlgorithm.HS256, secret)
                    .compact();
            log.info("Token generated successfully for user: {}", username);
            return token;
        } catch (Exception e) {
            log.error("Error generating token: {}", e.getMessage(), e);
        }
        return null;
    }

    public String getUsernameFromToken(String token) {
        log.info("Extracting username from token...");
        return getClaimFromToken(token, Claims::getSubject);
    }

    public String getRoleFromToken(String token) {
        log.info("Extracting role from token...");
        return getClaimFromToken(token, claims -> claims.get("role", String.class));
    }

    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        try {
            log.info("Parsing claims from token...");
            Claims claims = Jwts.parser()
                    .setSigningKey(Base64.getDecoder().decode(secret))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            log.error("Error parsing claims from token: {}", e.getMessage(), e);
        }
        return null;
    }
}