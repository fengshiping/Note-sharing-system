package com.noteshare.controller;

import com.noteshare.dto.ApiResponse;
import com.noteshare.entity.Course;
import com.noteshare.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/list")
    public ApiResponse getAllCourses() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ApiResponse.success("获取课程列表成功", courses);
        } catch (Exception e) {
            return ApiResponse.error("获取课程列表失败: " + e.getMessage());
        }
    }
}