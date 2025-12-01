package com.noteshare.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class NoteUploadRequest {
    private String title;
    private String description;
    private Long courseId;
    private MultipartFile file;
}