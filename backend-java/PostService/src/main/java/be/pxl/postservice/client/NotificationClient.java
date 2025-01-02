package be.pxl.postservice.client;

import be.pxl.postservice.domain.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    @PostMapping("/notification")
    void sendNotification(@RequestBody NotificationRequest notification);
}
