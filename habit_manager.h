#ifndef HABIT_MANAGER_H
#define HABIT_MANAGER_H

#include <string>
#include <vector>

class HabitManager {
public:
    HabitManager();
    void addHabit(const std::string& habit);
    void removeHabit(const std::string& habit);
    std::vector<std::string> listHabits() const;

private:
    std::vector<std::string> habits;
};

#endif // HABIT_MANAGER_H