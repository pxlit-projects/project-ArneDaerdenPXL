package be.pxl.services;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Discovery Service
 *
 */
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication
{
    public static void main( String[] args )
    {
        new SpringApplicationBuilder(DiscoveryServiceApplication.class).run(args);
    }
}
