package com.nobu.hotel.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    // Clé secrète HS256 (>= 32 chars de préférence)
    private String secret;

    // Expiration en millisecondes (défaut 24h)
    private long expiration = 86400000L;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public long getExpiration() { return expiration; }
    public void setExpiration(long expiration) { this.expiration = expiration; }
}
