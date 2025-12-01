package com.noteshare.service;

import com.noteshare.dto.NoteResponse;
import com.noteshare.entity.Course;
import com.noteshare.entity.Note;
import com.noteshare.entity.User;
import com.noteshare.repository.CourseRepository;
import com.noteshare.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private CourseRepository courseRepository;

    // 允许的文件类型
    private static final String[] ALLOWED_FILE_TYPES = {"pdf", "jpg", "jpeg", "png", "gif"};
    // 最大文件大小 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public Note uploadNote(String title, String description, Long courseId,
                           MultipartFile file, User user) throws IOException {

        // 验证课程是否存在
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("课程不存在"));

        // 验证文件类型
        String fileType = getFileExtension(file.getOriginalFilename());
        if (!isAllowedFileType(fileType)) {
            throw new RuntimeException("不支持的文件类型，仅支持: " +
                    String.join(", ", ALLOWED_FILE_TYPES));
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("文件大小不能超过10MB");
        }

        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 生成文件名（防止重名）
        String originalFileName = file.getOriginalFilename();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeFileName = timestamp + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");

        // 保存文件
        Path filePath = uploadPath.resolve(safeFileName);
        Files.copy(file.getInputStream(), filePath);

        // 创建笔记记录
        Note note = new Note();
        note.setTitle(title);
        note.setDescription(description);
        note.setFileName(originalFileName);
        note.setFilePath(filePath.toString());
        note.setFileSize(file.getSize());
        note.setFileType(fileType.toLowerCase());
        note.setCourse(course);
        note.setUser(user);

        return noteRepository.save(note);
    }

    public List<NoteResponse> getAllNotes() {
        List<Note> notes = noteRepository.findAllByOrderByCreatedTimeDesc();
        return notes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<NoteResponse> getNotesByCourse(Long courseId) {
        List<Note> notes = noteRepository.findByCourseIdOrderByCreatedTimeDesc(courseId);
        return notes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<NoteResponse> getNotesByUser(Long userId) {
        List<Note> notes = noteRepository.findByUserIdOrderByCreatedTimeDesc(userId);
        return notes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public Note getNoteById(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("笔记不存在"));
    }

    public void incrementDownloadCount(Long noteId) {
        Note note = getNoteById(noteId);
        note.setDownloadCount(note.getDownloadCount() + 1);
        noteRepository.save(note);
    }

    private NoteResponse convertToResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setTitle(note.getTitle());
        response.setDescription(note.getDescription());
        response.setFileName(note.getFileName());
        response.setFileType(note.getFileType());
        response.setFileSize(note.getFileSize());
        response.setDownloadCount(note.getDownloadCount());
        response.setCreatedTime(note.getCreatedTime());
        response.setCourseName(note.getCourse().getName());
        response.setUploaderName(note.getUser().getUsername());
        response.setDownloadUrl("/api/notes/" + note.getId() + "/download");
        return response;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isAllowedFileType(String fileType) {
        for (String allowedType : ALLOWED_FILE_TYPES) {
            if (allowedType.equalsIgnoreCase(fileType)) {
                return true;
            }
        }
        return false;
    }
}