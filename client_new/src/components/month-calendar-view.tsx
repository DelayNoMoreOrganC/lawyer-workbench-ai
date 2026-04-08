"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: number;
  task_title: string;
  priority: number;
  due_date: string;
}

interface Case {
  id: number;
  case_name: string;
  case_type: string;
  hearing_date: string;
}

interface MonthCalendarViewProps {
  tasks: Task[];
  cases: Case[];
  onDateClick?: (date: Date) => void;
}

export function MonthCalendarView({ tasks, cases, onDateClick }: MonthCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, tasks, cases]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取第一天是星期几（0-6，0是周日）
    const firstDayOfWeek = firstDay.getDay();

    // 生成日历数组
    const days: any[] = [];

    // 添加上月的剩余天数
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
        cases: getCasesForDate(date),
      });
    }

    // 添加当月的天数
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        tasks: getTasksForDate(date),
        cases: getCasesForDate(date),
      });
    }

    // 添加下月的天数，补齐到42天（6行）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
        cases: getCasesForDate(date),
      });
    }

    setCalendarDays(days);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toDateString();
      return taskDate === dateStr;
    });
  };

  const getCasesForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return cases.filter((caseItem) => {
      if (!caseItem.hearing_date) return false;
      const caseDate = new Date(caseItem.hearing_date).toDateString();
      return caseDate === dateStr;
    });
  };

  const getTaskColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-700 border-red-200";
    if (priority >= 3) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getCaseColor = (caseType: string) => {
    const colors: { [key: string]: string } = {
      民事: "bg-green-100 text-green-700 border-green-200",
      刑事: "bg-purple-100 text-purple-700 border-purple-200",
      行政: "bg-yellow-100 text-yellow-700 border-yellow-200",
      执行: "bg-pink-100 text-pink-700 border-pink-200",
    };
    return colors[caseType] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部控制区 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-gray-900">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              上月
            </button>
            <button
              onClick={goToToday}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              今天
            </button>
            <button
              onClick={nextMonth}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              下月
            </button>
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-blue-500"></div>
            <span>待办</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-green-500"></div>
            <span>开庭</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-red-500"></div>
            <span>紧急</span>
          </div>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="flex-1 grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const isToday = dayInfo.date.toDateString() === new Date().toDateString();
          const totalItems = dayInfo.tasks.length + dayInfo.cases.length;

          return (
            <div
              key={index}
              className={`
                border border-gray-200 rounded p-2 min-h-24 cursor-pointer transition hover:border-gray-300
                ${dayInfo.isCurrentMonth ? "bg-white" : "bg-gray-50 opacity-60"}
                ${isToday ? "ring-2 ring-blue-500" : ""}
              `}
              onClick={() => onDateClick && onDateClick(dayInfo.date)}
            >
              {/* 日期数字 */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    isToday ? "bg-blue-600 text-white px-1.5 py-0.5 rounded" : "text-gray-900"
                  }`}
                >
                  {dayInfo.day}
                </span>
                {totalItems > 0 && (
                  <span className="text-xs text-gray-500">{totalItems}</span>
                )}
              </div>

              {/* 待办事项 */}
              <div className="space-y-0.5">
                {dayInfo.tasks.slice(0, 2).map((task: Task) => (
                  <div
                    key={task.id}
                    className={`text-xs px-1 py-0.5 rounded ${getTaskColor(
                      task.priority
                    )} truncate`}
                    title={task.task_title}
                  >
                    {task.task_title}
                  </div>
                ))}

                {/* 开庭案件 */}
                {dayInfo.cases.slice(0, 2).map((caseItem: Case) => (
                  <div
                    key={caseItem.id}
                    className={`text-xs px-1 py-0.5 rounded ${getCaseColor(
                      caseItem.case_type
                    )} truncate`}
                    title={caseItem.case_name}
                  >
                    {caseItem.case_name}
                  </div>
                ))}

                {/* 更多提示 */}
                {(dayInfo.tasks.length > 2 || dayInfo.cases.length > 2) && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayInfo.tasks.length + dayInfo.cases.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}