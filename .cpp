#include "habit_manager.h"

#include <iostream>

void HabitManager::addHabit(const std::string& name, const std::string& description) {
    habits_.push_back({name, description, false});
}

void HabitManager::listHabits() const {
    if (habits_.empty()) {
        std::cout << "No hay hábitos registrados." << std::endl;
        return;
    }

    for (size_t i = 0; i < habits_.size(); ++i) {
        const Habit& habit = habits_[i];
        std::cout << (i + 1) << ". " << habit.name;

        if (habit.completed) {
            std::cout << " [completado]";
        }

        std::cout << std::endl;

        if (!habit.description.empty()) {
            std::cout << "   " << habit.description << std::endl;
        }
    }
}

void HabitManager::completeHabit(size_t index) {
    if (index >= habits_.size()) {
        std::cout << "Índice inválido." << std::endl;
        return;
    }

    habits_[index].completed = true;
}

void HabitManager::removeHabit(size_t index) {
    if (index >= habits_.size()) {
        std::cout << "Índice inválido." << std::endl;
        return;
    }

    habits_.erase(habits_.begin() + index);
}

size_t HabitManager::size() const {
    return habits_.size();
}