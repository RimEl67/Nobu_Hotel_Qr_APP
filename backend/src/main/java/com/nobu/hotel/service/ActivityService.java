package com.nobu.hotel.service;

import com.nobu.hotel.entity.Activity;
import com.nobu.hotel.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    public List<Activity> getAllActivities() {
        return activityRepository.findByAvailableTrue();
    }

    public List<Activity> getActivitiesByCategory(String category) {
        return activityRepository.findByCategoryAndAvailableTrue(category);
    }

    public Optional<Activity> getActivityById(Long id) {
        return activityRepository.findById(id);
    }

    public Activity saveActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }
}