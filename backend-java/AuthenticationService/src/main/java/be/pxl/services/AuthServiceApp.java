package be.pxl.services;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Hello world!
 *
 */
@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApp
{
    public static void main( String[] args )
    {
        new SpringApplicationBuilder(AuthServiceApp.class).run(args);
    }
}
