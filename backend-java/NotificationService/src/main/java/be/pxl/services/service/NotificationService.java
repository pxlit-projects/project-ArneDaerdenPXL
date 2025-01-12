package be.pxl.services.service;

import javax.management.Notification;

import be.pxl.services.domain.dto.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
    public void sendMessage(NotificationRequest notificationRequest) {
        log.info("Sending notification: {}", notificationRequest);
    }
}
