#pragma once

#include <string>
#include <vector>

struct Habit {
    std::string name;
    std::string description;
    bool completed;
};

class HabitManager {
public:
    void addHabit(const std::string& name, const std::string& description = "");
    void listHabits() const;
    void completeHabit(size_t index);
    void removeHabit(size_t index);
    size_t size() const;

private:
    std::vector<Habit> habits_;
};