package com.mycompany.teamoconsultingwebsite.config;

import com.mycompany.teamoconsultingwebsite.entity.Admin;
import com.mycompany.teamoconsultingwebsite.repository.AdminRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(AdminRepository adminRepository) {
        return username -> {
            Admin admin = adminRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

            return User.builder()
                    .username(admin.getEmail())
                    .password(admin.getPassword())
                    .roles(admin.getRole())
                    .build();
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/admin-login",
                                "/admin-login.html",
                                "/error",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/api/testimonials",
                                "/api/testimonials/approved"
                        ).permitAll()

                        .requestMatchers(
                                "/admin-testimonials",
                                "/api/testimonials/pending",
                                "/api/testimonials/*/approve",
                                "/api/testimonials/*/reject"
                        ).hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .formLogin(form -> form
                        .loginPage("/admin-login")
                        .loginProcessingUrl("/admin-login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .defaultSuccessUrl("/admin-testimonials", true)
                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")
                        .permitAll()
                );

        return http.build();
    }
}