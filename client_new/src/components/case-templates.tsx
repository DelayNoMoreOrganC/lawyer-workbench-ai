"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  case_type: string;
  defaultData: {
    case_name: string;
    case_type: string;
    case_status: string;
    court_name: string;
    plaintiff: string;
    defendant: string;
    case_brief: string;
  };
}

interface CaseTemplatesProps {
  onSelectTemplate: (template: CaseTemplate) => void;
}

const caseTemplates: CaseTemplate[] = [
  {
    id: "civil_contract",
    name: "合同纠纷",
    description: "买卖合同、租赁合同等民事合同纠纷",
    case_type: "民事",
    defaultData: {
      case_name: "合同纠纷案件",
      case_type: "民事",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "涉及合同履行争议，包括违约责任、损失赔偿等问题"
    }
  },
  {
    id: "civil_tort",
    name: "侵权纠纷",
    description: "人身损害、财产损害等侵权责任纠纷",
    case_type: "民事",
    defaultData: {
      case_name: "侵权责任纠纷案件",
      case_type: "民事",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "涉及侵权行为认定、损害赔偿计算等问题"
    }
  },
  {
    id: "civil_labor",
    name: "劳动争议",
    description: "劳动合同、工资福利、工伤赔偿等纠纷",
    case_type: "民事",
    defaultData: {
      case_name: "劳动争议案件",
      case_type: "民事",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "涉及劳动合同、工资支付、经济补偿等问题"
    }
  },
  {
    id: "criminal_theft",
    name: "盗窃案件",
    description: "盗窃、诈骗等侵财犯罪案件",
    case_type: "刑事",
    defaultData: {
      case_name: "盗窃案件",
      case_type: "刑事",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "涉嫌盗窃罪，涉及金额认定、量刑情节等问题"
    }
  },
  {
    id: "criminal_intentional",
    name: "故意伤害",
    description: "故意伤害、过失致人伤害等案件",
    case_type: "刑事",
    defaultData: {
      case_name: "故意伤害案件",
      case_type: "刑事",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "涉嫌故意伤害罪，涉及伤情鉴定、量刑情节等问题"
    }
  },
  {
    id: "administrative",
    name: "行政诉讼",
    description: "对行政行为不服提起的诉讼",
    case_type: "行政",
    defaultData: {
      case_name: "行政诉讼案件",
      case_type: "行政",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "不服行政机关作出的具体行政行为，请求法院予以撤销或变更"
    }
  },
  {
    id: "execution",
    name: "执行案件",
    description: "判决裁定生效后的强制执行申请",
    case_type: "执行",
    defaultData: {
      case_name: "执行案件",
      case_type: "执行",
      case_status: "draft",
      court_name: "",
      plaintiff: "",
      defendant: "",
      case_brief: "申请强制执行已生效的法院判决或仲裁裁决"
    }
  }
];

export function CaseTemplates({ onSelectTemplate }: CaseTemplatesProps) {
  return (
    <div className="w-full">
      <h2 className="text-base font-semibold mb-2">选择案件类型</h2>
      <p className="text-sm text-gray-600 mb-4">
        选择案件类型以快速创建，或直接跳过手动填写
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {caseTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer hover:shadow-md transition-all border border-gray-200 hover:border-blue-300"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {template.description}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                {template.case_type}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">
          提示：选择案件类型后，系统将自动填充基础信息，您可以根据实际情况修改
        </p>
      </div>
    </div>
  );
}
