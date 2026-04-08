"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: number;
  task_title: string;
  task_description: string;
  task_type: string;
  priority: number;
  due_date: string;
}

interface Case {
  id: number;
  case_name: string;
  case_type: string;
  hearing_date: string;
  court_name: string;
}

interface ScheduleViewProps {
  tasks: Task[];
  cases: Case[];
  selectedDate: Date;
}

export function ScheduleView({ tasks, cases, selectedDate }: ScheduleViewProps) {
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);

  useEffect(() => {
    generateScheduleItems();
  }, [tasks, cases, selectedDate]);

  const generateScheduleItems = () => {
    const items: any[] = [];
    const selectedDateStr = selectedDate.toDateString();

    // 获取选中日期的待办事项
    const dayTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toDateString();
      return taskDate === selectedDateStr;
    });

    // 获取选中日期的开庭案件
    const dayCases = cases.filter((caseItem) => {
      if (!caseItem.hearing_date) return false;
      const caseDate = new Date(caseItem.hearing_date).toDateString();
      return caseDate === selectedDateStr;
    });

    // 按时间排序并生成时间段
    const timeSlots: { [key: string]: any[] } = {};

    // 添加待办事项到对应时间段
    dayTasks.forEach((task) => {
      const hour = new Date(task.due_date).getHours();
      const timeKey = `${hour}:00`;

      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = [];
      }

      timeSlots[timeKey].push({
        type: "task",
        data: task,
        time: new Date(task.due_date),
      });
    });

    // 添加开庭案件到对应时间段（假设开庭时间为上午9点）
    dayCases.forEach((caseItem) => {
      const timeKey = "9:00"; // 默认开庭时间

      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = [];
      }

      timeSlots[timeKey].push({
        type: "case",
        data: caseItem,
        time: new Date(`${caseItem.hearing_date}T09:00:00`),
      });
    });

    // 生成有序的时间段列表
    const sortedTimes = Object.keys(timeSlots).sort((a, b) => {
      const hourA = parseInt(a.split(":")[0]);
      const hourB = parseInt(b.split(":")[0]);
      return hourA - hourB;
    });

    // 创建日程项数组
    const scheduleData: any[] = [];
    sortedTimes.forEach((time) => {
      scheduleData.push({
        time,
        items: timeSlots[time],
      });
    });

    setScheduleItems(scheduleData);
  };

  const getTaskColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 border-red-300 text-red-800";
    if (priority >= 3) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-blue-100 border-blue-300 text-blue-800";
  };

  const getCaseColor = (caseType: string) => {
    const colors: { [key: string]: string } = {
      民事: "bg-green-100 border-green-300 text-green-800",
      刑事: "bg-purple-100 border-purple-300 text-purple-800",
      行政: "bg-yellow-100 border-yellow-300 text-yellow-800",
      执行: "bg-pink-100 border-pink-300 text-pink-800",
    };
    return colors[caseType] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  // 生成时间段（8:00 - 18:00）
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${i}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="h-full flex">
      {/* 时间轴 */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200">
        {timeSlots.map((time) => (
          <div key={time} className="h-20 flex items-center justify-center pr-4 border-b border-gray-100">
            <span className="text-sm text-gray-600 font-medium">{time}</span>
          </div>
        ))}
      </div>

      {/* 日程内容 */}
      <div className="flex-1 overflow-y-auto">
        {scheduleItems.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-sm">本日暂无安排</p>
              <p className="text-xs text-gray-400 mt-1">
                待办事项和开庭将在此处显示
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 背景网格 */}
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-20 border-b border-gray-100"
              />
            ))}

            {/* 日程项 */}
            {scheduleItems.map((scheduleItem) => {
              const hour = parseInt(scheduleItem.time.split(":")[0]);
              const topPosition = (hour - 8) * 80; // 每小时80px高度

              return (
                <div
                  key={scheduleItem.time}
                  className="absolute left-2 right-2"
                  style={{ top: `${topPosition}px` }}
                >
                  <div className="space-y-2">
                    {scheduleItem.items.map((item: any, index: number) => (
                      <div
                        key={`${item.type}-${item.data.id}-${index}`}
                        className={`p-3 rounded-lg border-l-4 shadow-sm cursor-pointer transition hover:shadow-md ${
                          item.type === "task"
                            ? getTaskColor(item.data.priority)
                            : getCaseColor(item.data.case_type)
                        }`}
                        onClick={() => {
                          if (item.type === "case") {
                            window.location.href = `/cases/${item.data.id}`;
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === "task" ? (
                                <>
                                  <span className="text-sm">📋</span>
                                  <span className="font-medium text-sm">
                                    {item.data.task_title}
                                  </span>
                                  <Badge className="text-xs">
                                    P{item.data.priority}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm">⚖️</span>
                                  <span className="font-medium text-sm">
                                    {item.data.case_name}
                                  </span>
                                  <Badge className="text-xs">
                                    {item.data.case_type}
                                  </Badge>
                                </>
                              )}
                            </div>
                            {item.type === "task" && item.data.task_description && (
                              <p className="text-xs opacity-75 mt-1">
                                {item.data.task_description}
                              </p>
                            )}
                            {item.type === "case" && item.data.court_name && (
                              <p className="text-xs opacity-75 mt-1">
                                🏛️ {item.data.court_name}
                              </p>
                            )}
                          </div>
                          <span className="text-xs opacity-75">
                            {scheduleItem.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}