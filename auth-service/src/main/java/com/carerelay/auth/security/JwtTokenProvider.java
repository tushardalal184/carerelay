package com.carerelay.auth.security;

import com.carerelay.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${carerelay.jwt.secret:CareRelaySuperSecretKeyForDevelopmentPurposesMustBeAtLeast256BitsLong!}")
    private String jwtSecret;

    @Value("${carerelay.jwt.expiration-ms:86400000}") // 24 hours default
    private long jwtExpirationMs;

    public String generateToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("department", user.getDepartment() != null ? user.getDepartment() : "")
                .claim("fullName", user.getFirstName() + " " + user.getLastName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }
}
