package be.pxl.services.services;

import javax.management.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
    public void sendMessage(Notification notification) {
        log.info("Sending notification: {}", notification);
    }
}
