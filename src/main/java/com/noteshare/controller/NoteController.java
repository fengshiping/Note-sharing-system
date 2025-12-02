package com.noteshare.controller;

import com.noteshare.dto.ApiResponse;
import com.noteshare.dto.NoteResponse;
import com.noteshare.entity.Note;
import com.noteshare.entity.User;
import com.noteshare.repository.NoteRepository;
import com.noteshare.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private NoteRepository noteRepository;

    @PostMapping("/upload")
    public ApiResponse uploadNote(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("courseId") Long courseId,
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ApiResponse.error("请先登录");
            }

            Note note = noteService.uploadNote(title, description, courseId, file, user);
            return ApiResponse.success("笔记上传成功", note.getId());

        } catch (IOException e) {
            return ApiResponse.error("文件上传失败: " + e.getMessage());
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/list")
    public ApiResponse getAllNotes() {
        try {
            List<NoteResponse> notes = noteService.getAllNotes();
            return ApiResponse.success("获取笔记列表成功", notes);
        } catch (Exception e) {
            return ApiResponse.error("获取笔记列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse getNotesByCourse(@PathVariable Long courseId) {
        try {
            List<NoteResponse> notes = noteService.getNotesByCourse(courseId);
            return ApiResponse.success("获取课程笔记成功", notes);
        } catch (Exception e) {
            return ApiResponse.error("获取课程笔记失败: " + e.getMessage());
        }
    }

    @GetMapping("/my-notes")
    public ApiResponse getMyNotes(HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ApiResponse.error("请先登录");
            }

            List<NoteResponse> notes = noteService.getNotesByUserWithDeletable(user.getId(), user.getId());
            return ApiResponse.success("获取我的笔记成功", notes);
        } catch (Exception e) {
            return ApiResponse.error("获取我的笔记失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadNote(@PathVariable Long id) {
        try {
            Note note = noteService.getNoteById(id);
            Path filePath = Paths.get(note.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // 增加下载计数
                noteService.incrementDownloadCount(id);

                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + note.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteNote(@PathVariable Long id, HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ApiResponse.error("请先登录");
            }

            // 获取笔记
            Note note = noteService.getNoteById(id);

            // 权限检查：只能删除自己的笔记
            if (!note.getUser().getId().equals(user.getId())) {
                return ApiResponse.error("无权删除此笔记");
            }

            // 删除文件
            try {
                Path filePath = Paths.get(note.getFilePath());
                Files.deleteIfExists(filePath);
                System.out.println("删除文件成功: " + filePath);
            } catch (IOException e) {
                System.out.println("删除文件失败: " + e.getMessage());
                // 记录日志但不阻止删除数据库记录
            }

            // 删除数据库记录
            noteRepository.delete(note);

            return ApiResponse.success("删除笔记成功");

        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("删除笔记失败: " + e.getMessage());
        }
    }
}