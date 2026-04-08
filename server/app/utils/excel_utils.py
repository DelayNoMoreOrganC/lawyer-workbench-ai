import pandas as pd
from openpyxl import load_workbook
from typing import Dict, List, Any
from datetime import datetime


class ExcelHandler:
    """Excel处理工具"""

    # 案件字段映射（中文 -> 数据库字段）
    CASE_FIELD_MAPPING = {
        "债务人名称": "debtor_name",
        "阶段": "stage",
        "一审立案时间": "litigation_filing_date",
        "审判案号": "trial_case_number",
        "诉讼承办法官、书记员及联系方式": "judge_info",
        "一审判决/调解时间": "judgment_date",
        "诉讼进展": "litigation_progress",
        "执行立案时间": "execution_filing_date",
        "执行案号": "execution_case_number",
        "执行进展": "execution_progress",
        "执行状态": "execution_status",
        "执行法官/书记员及联系方式": "execution_judge_info",
        "查封情况": "seizure_info",
        "查封到期日": "seizure_expiry_date",
        "基础律师费": "base_attorney_fee",
        "清收金额": "collection_amount",
        "风险代理费": "risk_attorney_fee"
    }

    @classmethod
    def import_case_excel(cls, file_path: str) -> Dict[str, Any]:
        """导入案件Excel（单个案件格式）"""
        try:
            # 读取Excel
            df = pd.read_excel(file_path, engine='openpyxl')

            # 转换为字典格式
            case_data = {}
            for _, row in df.iterrows():
                field_name = str(row.get('要素信息', '')).strip()
                field_value = row.get('案件信息', '')

                if field_name in cls.CASE_FIELD_MAPPING:
                    db_field = cls.CASE_FIELD_MAPPING[field_name]
                    case_data[db_field] = cls._parse_value(field_value, field_name)

            return case_data
        except Exception as e:
            raise Exception(f"导入Excel失败: {str(e)}")

    @classmethod
    def _parse_value(cls, value: Any, field_name: str) -> Any:
        """解析字段值"""
        if pd.isna(value) or value == '':
            return None

        # 日期字段处理
        if '时间' in field_name or '日期' in field_name:
            if isinstance(value, datetime):
                return value
            if isinstance(value, str):
                try:
                    return pd.to_datetime(value).to_pydatetime()
                except:
                    return value

        # 数字字段处理
        if field_name in ['基础律师费', '清收金额', '风险代理费']:
            try:
                return float(value)
            except:
                return 0.0

        return value

    @classmethod
    def export_case_excel(cls, case_data: Dict[str, Any], output_path: str):
        """导出案件Excel（单个案件格式）"""
        try:
            # 准备数据
            excel_data = {
                "要素信息": [],
                "案件信息": []
            }

            for field_name, db_field in cls.CASE_FIELD_MAPPING.items():
                excel_data["要素信息"].append(field_name)
                value = case_data.get(db_field, "")
                excel_data["案件信息"].append(cls._format_value(value, field_name))

            # 创建DataFrame
            df = pd.DataFrame(excel_data)

            # 保存Excel
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='案件信息', index=False)

                # 调整列宽
                worksheet = writer.sheets['案件信息']
                worksheet.column_dimensions['A'].width = 30
                worksheet.column_dimensions['B'].width = 60

        except Exception as e:
            raise Exception(f"导出Excel失败: {str(e)}")

    @classmethod
    def _format_value(cls, value: Any, field_name: str) -> str:
        """格式化字段值"""
        if value is None:
            return ""

        # 日期格式化
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d')

        # 数字格式化
        if isinstance(value, float) and field_name in ['基础律师费', '清收金额', '风险代理费']:
            return f"{value:.2f}"

        return str(value)

    @classmethod
    def export_summary_excel(cls, cases: List[Dict[str, Any]], output_path: str):
        """导出汇总Excel"""
        try:
            # 准备汇总数据
            summary_data = []
            for idx, case in enumerate(cases, 1):
                row = {
                    "编号": idx,
                    "债务人名称": case.get("debtor_name", ""),
                    "阶段": case.get("stage", ""),
                    "一审立案时间": cls._format_date(case.get("litigation_filing_date")),
                    "审判案号": case.get("trial_case_number", ""),
                    "一审判决/调解时间": cls._format_date(case.get("judgment_date")),
                    "执行立案时间": cls._format_date(case.get("execution_filing_date")),
                    "执行案号": case.get("execution_case_number", ""),
                    "执行状态": case.get("execution_status", ""),
                    "基础律师费": case.get("base_attorney_fee", ""),
                    "清收金额": case.get("collection_amount", ""),
                    "风险代理费": case.get("risk_attorney_fee", "")
                }
                summary_data.append(row)

            # 创建DataFrame
            df = pd.DataFrame(summary_data)

            # 保存Excel
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='案件汇总', index=False)

                # 调整列宽
                worksheet = writer.sheets['案件汇总']
                for idx, col in enumerate(df.columns, 1):
                    max_length = max(
                        df[col].astype(str).apply(len).max(),
                        len(col)
                    )
                    worksheet.column_dimensions[chr(64 + idx)].width = min(max_length + 2, 50)

        except Exception as e:
            raise Exception(f"导出汇总Excel失败: {str(e)}")

    @classmethod
    def _format_date(cls, value: Any) -> str:
        """格式化日期"""
        if value is None:
            return ""
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d')
        return str(value)
