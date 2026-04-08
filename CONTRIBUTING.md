# 贡献指南

感谢您考虑为律师工作台AI项目做出贡献！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题

- 使用 [GitHub Issues](https://github.com/yourusername/lawyer-workbench-ai/issues) 报告bug
- 在报告中包含：
  - 清晰的标题和描述
  - 复现步骤
  - 预期行为和实际行为
  - 截图（如适用）
  - 环境信息（操作系统、Node.js版本、Python版本等）

### 提交代码

1. **Fork 仓库**
   ```bash
   # 在GitHub上点击Fork按钮
   ```

2. **克隆您的fork**
   ```bash
   git clone https://github.com/yourusername/lawyer-workbench-ai.git
   cd lawyer-workbench-ai
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **进行更改**
   - 遵循现有代码风格
   - 添加必要的测试
   - 更新相关文档

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加某功能"
   # 或
   git commit -m "fix: 修复某问题"
   ```

6. **推送到您的fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建Pull Request**
   - 在GitHub上创建Pull Request
   - 填写PR模板
   - 等待代码审查

## 📝 代码规范

### 前端 (Vue 3)

```javascript
// 组件命名：PascalCase
export default {
  name: 'UserProfile'
}

// 函数命名：camelCase
function getUserData() {
  // ...
}

// 常量命名：UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000/api'
```

### 后端 (Python)

```python
# 函数命名：snake_case
def get_user_data():
    pass

# 类命名：PascalCase
class UserService:
    pass

# 常量命名：UPPER_SNAKE_CASE
MAX_UPLOAD_SIZE = 10485760
```

## 🎯 提交信息规范

使用语义化提交信息：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

示例：
```
feat: 添加案件批量导入功能
fix: 修复日历事件时间显示错误
docs: 更新README安装说明
```

## 🧪 测试

在提交代码前，请确保：

1. **前端测试**
   ```bash
   cd client
   npm run lint
   npm run test  # 如果有测试
   ```

2. **后端测试**
   ```bash
   cd server
   pytest  # 如果有测试
   ```

3. **手动测试**
   - 启动前后端服务
   - 测试修改的功能
   - 确保没有引入新的bug

## 📚 文档

如果您添加了新功能或更改了API，请更新：

- README.md（如果是用户可见的功能）
- API文档（后端Swagger文档）
- 代码注释

## 🎨 代码风格

### Vue.js
- 使用Composition API
- 组件文件使用PascalCase命名
- Props使用camelCase，但在模板中使用kebab-case

### Python
- 遵循PEP 8规范
- 使用类型提示
- 添加docstring文档

## 🐛 Bug修复优先级

- **Critical**: 生产环境崩溃
- **High**: 核心功能无法使用
- **Medium**: 影响用户体验但不阻塞使用
- **Low**: 界面小问题或优化建议

## 💡 功能建议

我们欢迎功能建议！在提交Issue前：

1. 检查是否已有相同建议
2. 清楚描述功能用途
3. 说明为什么这个功能有价值
4. 如果可能，提供实现思路

## 📧 联系方式

如有问题，请通过以下方式联系：

- GitHub Issues
- Email: your-email@example.com

## 🙏 致谢

感谢所有贡献者的付出！您的贡献让这个项目变得更好。

---

**注意**: 请确保您有权分享您提交的代码，并且不包含任何敏感信息或专有代码。