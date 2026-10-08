package com.carerelay.auth.config;

import com.carerelay.auth.entity.User;
import com.carerelay.auth.entity.UserRole;
import com.carerelay.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            log.info("Database users table is empty. Seeding initial clinical accounts...");
            String passwordHash = passwordEncoder.encode("password123");

            User alice = new User("alice.smith@hospital.org", passwordHash, "Alice", "Smith", UserRole.DOCTOR, "Cardiology");
            alice.setId(UUID.fromString("a0000000-0000-0000-0000-000000000001"));
            userRepository.save(alice);

            User bob = new User("bob.johnson@hospital.org", passwordHash, "Bob", "Johnson", UserRole.DOCTOR, "Neurology");
            bob.setId(UUID.fromString("a0000000-0000-0000-0000-000000000002"));
            userRepository.save(bob);

            User carol = new User("carol.davis@hospital.org", passwordHash, "Carol", "Davis", UserRole.NURSE, "Emergency");
            carol.setId(UUID.fromString("a0000000-0000-0000-0000-000000000003"));
            userRepository.save(carol);

            User sarah = new User("sarah.connor@hospital.org", passwordHash, "Sarah", "Connor", UserRole.ADMIN, "Operations");
            sarah.setId(UUID.fromString("a0000000-0000-0000-0000-000000000004"));
            userRepository.save(sarah);

            log.info("Pre-seeded 4 clinical accounts into database (Password: 'password123').");
        }
    }
}
