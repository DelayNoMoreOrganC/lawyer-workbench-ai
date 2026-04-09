"use client";

import { Check } from "lucide-react";

interface CaseStatusStep {
  key: string;
  label: string;
  description: string;
}

const caseStatusSteps: CaseStatusStep[] = [
  { key: "draft", label: "起草中", description: "案件信息录入" },
  { key: "pending_filing", label: "待立案", description: "准备立案材料" },
  { key: "submitted", label: "已立案", description: "法院已受理" },
  { key: "first_trial", label: "一审审理中", description: "开庭审理" },
  { key: "waiting_judgment", label: "待判决", description: "等待法院判决" },
  { key: "judged", label: "已判决", description: "法院已作出判决" },
  { key: "pending_appeal", label: "待上诉", description: "上诉期限内" },
  { key: "second_trial", label: "二审审理中", description: "上诉审理" },
  { key: "final_judgment", label: "终审判决", description: "判决生效" },
  { key: "execution", label: "执行中", description: "申请执行" },
  { key: "completed", label: "已结案", description: "案件结束" },
];

interface CaseStatusStepperProps {
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  readOnly?: boolean;
}

export function CaseStatusStepper({ currentStatus, onStatusChange, readOnly = false }: CaseStatusStepperProps) {
  const getCurrentStepIndex = () => {
    const index = caseStatusSteps.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const handleStatusClick = (stepKey: string) => {
    if (readOnly || !onStatusChange) return;

    const currentIndex = getCurrentStepIndex();
    const targetIndex = caseStatusSteps.findIndex(step => step.key === stepKey);

    // 只允许前进到下一步或回退到已完成的状态
    if (targetIndex <= currentIndex + 1) {
      onStatusChange(stepKey);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">案件状态</h3>
      </div>

      {/* 当前状态卡片 */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">当前状态</p>
            <p className="text-lg font-semibold text-gray-900">
              {caseStatusSteps[getCurrentStepIndex()].label}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {caseStatusSteps[getCurrentStepIndex()].description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">进度</p>
            <p className="text-lg font-semibold text-blue-600">
              {getCurrentStepIndex() + 1} / {caseStatusSteps.length}
            </p>
          </div>
        </div>
      </div>

      {/* 状态选择按钮 */}
      {!readOnly && onStatusChange && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-2">更改状态</p>
          <div className="grid grid-cols-3 gap-2">
            {caseStatusSteps.map((step, index) => {
              const isCompleted = index < getCurrentStepIndex();
              const isCurrent = step.key === currentStatus;

              return (
                <button
                  key={step.key}
                  onClick={() => handleStatusClick(step.key)}
                  disabled={readOnly || index > getCurrentStepIndex() + 1}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-green-50 border-green-200 text-green-700"
                      : isCurrent
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  } ${index > getCurrentStepIndex() + 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="font-medium">{step.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}